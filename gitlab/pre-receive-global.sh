#!/bin/bash

REPO_PATH=$(pwd)
REPO_NAME=$(basename "$REPO_PATH" .git)

# 提取远程地址中的 group/project
REMOTE_URL=$(git config --get remote.origin.url)
GROUP=$(echo "$REMOTE_URL" | sed -E 's#.*[:/](.+)/(.+)\.git#\1#')
PROJECT=$(echo "$REMOTE_URL" | sed -E 's#.*[:/](.+)/(.+)\.git#\2#')

LOG_FILE="/tmp/hook-${REPO_NAME}.log"
RESPONSE_FILE="/tmp/hook-${REPO_NAME}.response"
RULE_CHECK_URL="http://host.docker.internal:2011/check"
WHITELIST=("project-a" "secure-api" "frontend")

GROUP_PROJECT="$GL_PROJECT_PATH"
GROUP=$(dirname "$GROUP_PROJECT")
PROJECT=$(basename "$GROUP_PROJECT")

ALLOWED_SUFFIXES="\.go$|\.php$|\.py$|\.java$"

# 白名单检查
#if [[ ! " ${WHITELIST[@]} " =~ " ${PROJECT} " ]]; then
    #echo "$(date) 跳过：项目 $PROJECT 不在白名单" >> "$LOG_FILE"
    #exit 0
#fi

echo "$(date) >>> pre-receive hook for $PROJECT [$GROUP]" >> "$LOG_FILE"
echo "准备检查..."

while read oldrev newrev refname; do
    echo "处理分支：$refname" >> "$LOG_FILE"
    
    branch=$(echo "$refname" | sed 's#refs/heads/##')
    author=$(git log -1 --pretty=format:'%an' "$newrev")
    files=$(git diff --name-only "$oldrev" "$newrev")

   # 获取最新提交信息
    commit_hash=$(git log -1 --pretty=format:"%H" "$newrev")
    email=$(git log -1 --pretty=format:"%ae" "$newrev")
    commit_msg=$(git log -1 --pretty=format:"%s" "$newrev")

    file_content_json=""

    for file in $files; do
        echo "处理文件：$file" >> "$LOG_FILE"

        git cat-file -e "$newrev:$file" 2>/dev/null || {
            echo "文件已删除，跳过：$file" >> "$LOG_FILE"
            continue
        }

         # 跳过不符合扩展名的文件
        if ! [[ "$file" =~ $ALLOWED_SUFFIXES ]]; then
            echo "跳过非允许类型文件：$file" >> "$LOG_FILE"
            continue
        fi

       # content=$(git show "$newrev:$file" 2>/dev/null)
       # escaped=$(echo "$content" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/' | tr -d '\n')
       # file_content_json="$file_content_json\"$file\":\"$escaped\","

       # 获取并 base64 编码文件内容
       content_base64=$(git show "$newrev:$file" | base64 | tr -d '\n')
       file_content_json="$file_content_json\"$file\":\"$content_base64\","
       
    done

    file_content_json="${file_content_json%,}"  # 去掉尾逗号

    json_payload=$(cat <<EOF
{
  "group": "$GROUP",
  "project": "$PROJECT",
  "branch": "$branch",
  "author": "$author",
  "files": [$(echo "$files" | sed 's/.*/"&"/' | paste -sd "," -)],
  "content": { $file_content_json },
  "commit_hash": "$commit_hash",
  "email": "$email",
  "commit_msg": "$commit_msg"
}
EOF
)

    echo "构建 JSON 完成：" >> "$LOG_FILE"

   # response=$(curl -s --max-time 3 -o "$RESPONSE_FILE" -w "%{http_code}" -X POST "$RULE_CHECK_URL" \
   #     -H "Content-Type: application/json" \
   #     -d "$json_payload")

   # 保存 JSON 到临时文件
    JSON_TMP="/tmp/hook-${REPO_NAME}.json"
    echo "$json_payload" > "$JSON_TMP"

    # 用 --data @filename 来传递
    response=$(curl -s --max-time 3 -o "$RESPONSE_FILE" -w "%{http_code}" -X POST "$RULE_CHECK_URL" \
        -H "Content-Type: application/json" \
        --data @"$JSON_TMP")

    echo "服务响应：$response" >> "$LOG_FILE"
    cat "$RESPONSE_FILE" >> "$LOG_FILE"

    if [ "$response" != "200" ]; then
        echo "" >&2
        echo "❌ 提交被拒绝：" >&2
        cat "$RESPONSE_FILE" >&2
        echo "" >&2
        exit 1
    fi
done

echo "$(date) >>> hook passed for $PROJECT [$GROUP]" >> "$LOG_FILE"
exit 0
