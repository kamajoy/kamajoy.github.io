#!/bin/bash

REPO_PATH=$(pwd)
REPO_NAME=$(basename "$REPO_PATH" .git)

REMOTE_URL=$(git config --get remote.origin.url)
GROUP=$(echo "$REMOTE_URL" | sed -E 's#.*[:/](.+)/(.+)\.git#\1#')
PROJECT=$(echo "$REMOTE_URL" | sed -E 's#.*[:/](.+)/(.+)\.git#\2#')

LOG_FILE="/tmp/hook-${REPO_NAME}.log"
RESPONSE_FILE="/tmp/hook-${REPO_NAME}.response"

#RULE_CHECK_URL="http://host.docker.internal/gitlab/hook"
RULE_CHECK_URL="https://gitlab-hook.sy.ngfycom/gitlab/hook"

WHITELIST=("project-a" "secure-api" "frontend")

GROUP_PROJECT="$GL_PROJECT_PATH"
GROUP=$(dirname "$GROUP_PROJECT")
PROJECT=$(basename "$GROUP_PROJECT")

ALLOWED_SUFFIXES="\.go$|\.php$"

echo "$(date) >>> pre-receive hook for $PROJECT [$GROUP]" >> "$LOG_FILE"
echo "准备检查..."

# 检测操作类型的函数
detect_action_type() {
    local oldrev="$1"
    local newrev="$2"
    local refname="$3"
    
    # 检查是否为合并提交
    if [ "$newrev" != "0000000000000000000000000000000000000000" ]; then
        # 获取父提交数量
        parent_count=$(git cat-file -p "$newrev" | grep "^parent " | wc -l)
        
        # 如果有超过1个父提交，说明是合并提交
        if [ "$parent_count" -gt 1 ]; then
            echo "merge"
            return
        fi
        
        # 检查提交消息是否包含合并标识
        commit_msg=$(git log -1 --pretty=format:"%s" "$newrev")
        if echo "$commit_msg" | grep -qE "^Merge (branch|pull request|request)" || \
           echo "$commit_msg" | grep -qE "Merge.*into.*" || \
           echo "$commit_msg" | grep -qE "^Merged in.*"; then
            echo "merge"
            return
        fi
    fi
    # 默认为推送
    echo "push"
}

while read oldrev newrev refname; do
    echo "处理分支：$refname" >> "$LOG_FILE"

     # 跳过删除分支操作
    if [ "$newrev" = "0000000000000000000000000000000000000000" ]; then
        echo "跳过分支删除操作: $refname" >> "$LOG_FILE"
        continue
    fi
    
    branch=$(echo "$refname" | sed 's#refs/heads/##')
    author=$(git log -1 --pretty=format:'%an' "$newrev")
    files=$(git diff --name-only "$oldrev" "$newrev")

   # 获取最新提交信息
    commit_hash=$(git log -1 --pretty=format:"%H" "$newrev")
    email=$(git log -1 --pretty=format:"%ae" "$newrev")
    commit_msg=$(git log -1 --pretty=format:"%s" "$newrev")

    # 检测操作类型
    action_type=$(detect_action_type "$oldrev" "$newrev" "$refname")
    echo "检测到操作类型：$action_type" >> "$LOG_FILE"

    file_content_json=""

    for file in $files; do
        echo "处理文件：$file" >> "$LOG_FILE"

        git cat-file -e "$newrev:$file" 2>/dev/null || {
            echo "文件已删除，跳过：$file" >> "$LOG_FILE"
            continue
        }

        if ! [[ "$file" =~ $ALLOWED_SUFFIXES ]]; then
            echo "跳过非允许类型文件：$file" >> "$LOG_FILE"
            continue
        fi

        #diff
        diff_content_json=""
        # 获取文件的 diff 内容并 base64 编码
        #diff_text=$(git diff "$oldrev" "$newrev" -- "$file")
        #diff_text=$(git diff "$oldrev" "$newrev" -- "$file" | grep '^+' | grep -v '^+++' )
        diff_text=$(git diff "$oldrev" "$newrev" -- "$file" | grep '^+' | grep -v '^+++' | sed 's/^+//')
        diff_base64=$(echo "$diff_text" | base64 | tr -d '\n')
        diff_content_json="$diff_content_json\"$file\":\"$diff_base64\","
        diff_content_json="${diff_content_json%,}"

       content_base64=$(git show "$newrev:$file" | base64 | tr -d '\n')
       file_content_json="$file_content_json\"$file\":\"$content_base64\","
       
    done

    diff_content_json="${diff_content_json%,}"
    file_content_json="${file_content_json%,}"  # 去掉尾逗号

    json_payload=$(cat <<EOF
{
  "group": "$GROUP",
  "project": "$PROJECT",
  "branch": "$branch",
  "author": "$author",
  "files": [$(echo "$files" | sed 's/.*/"&"/' | paste -sd "," -)],
  "content": { $file_content_json },
  "diff": { $diff_content_json },
  "commit_hash": "$commit_hash",
  "email": "$email",
  "commit_msg": "$commit_msg",
  "action_type": "$action_type"
}
EOF
)

    echo "构建 JSON 完成：" >> "$LOG_FILE"
    JSON_TMP="/tmp/hook-${REPO_NAME}.json"
    echo "$json_payload" > "$JSON_TMP"

    response=$(curl -s --max-time 3 -o "$RESPONSE_FILE" -w "%{http_code}" -X POST "$RULE_CHECK_URL" \
        -H "Content-Type: application/json" \
        --data @"$JSON_TMP")

    echo "服务响应：$response" >> "$LOG_FILE"
    cat "$RESPONSE_FILE" >> "$LOG_FILE"

    if [ "$response" != "200" ]; then
        echo "" >&2
        echo "❌ 提交被拒绝 " >&2
        cat "$RESPONSE_FILE" >&2
        echo "" >&2
        exit 1
    fi
done

echo "$(date) >>> hook passed for $PROJECT [$GROUP]" >> "$LOG_FILE"
exit 0
