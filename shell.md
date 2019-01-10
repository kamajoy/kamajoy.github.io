### grep

```
P/E    解释模式作为Perl的正则表达式匹配,P-perl正则，E-egrep命令       cat abc.txt | grep -P 'ABC(DEF)G[a-z]{0,3}XYZ'

o    仅显示匹配的行，即匹配的内容，如搜索 abc ，匹配成功则只显示abc内容。cat abc.txt | grep -o 'abc'

i    忽略大小写         cat abc.txt | grep -i | grep 'Abc' 

n    输出结果时同时输出该行的行号  cat abc.txt | grep -n 'abc'

l    从多文件查找时，只输出找到匹配内容的文件名	cat abc.txt | grep -l 'abc'

h    从多个文件查找时，只输出匹配的内容，不显示文件名  cat abc.txt | grep -h 'abc'

c    只输出匹配内容的总行数	cat abc.txt | grep -c 'abc'

v    反向查找，输出匹配内容以外的内容（未匹配的到的内容）		cat abc.txt | grep -v 'abc'

R/r  按目录递归查找 cat abc.txt | grep -r 'abc' * 或  /home/work/code grep -R --include="*.conf" "关键字" /home/wiki 

F    将范本样式视为固定字符串的列表。	cat abc.txt | grep -F 'abc'

grep -r -P -n --exclude='a.php' 'abc|1242' work   #在搜索结果中排除a.php文件检索,这里的文件名可以用正则
即：包含用 --include='xxx.file'参数，不包含用exclude='xxx.file参数，需配合目录使用

注：不加参数默认是输出匹配的行，grep支持正则表达式(加参数P即可)

```

### find
```
查找并输出内容: 
	find 要查找的目录 -name "关键字" -printf

所有为 .conf 的文件:
	 find 要查找的目录 -name "*.conf"

查找前两个是字母，第三个是数组,后面是 .d的文件：
	find /etc -name "[a-z][a-z][0-9].d"
```

### awk
##### awk语法
    a、awk [-F] 'conmand' input-file
    b、awk -f script input-file
    注：第一种是直接调用命令，第二种是调用文件命令，第一种选项F是用于指定域分隔符，
    默认情况下，awk使用空格作为分隔符，

##### awk输出
```
	第一个域：$1,
	第二个域：$2  
	.....................
   如果要输出整个字符串：$0 即可 
```
##### awk输出函数：print
```
分解passwd文件，格式：
user1:501:501:/home/user1:/bin/bash
显然可以用：作为域分隔符，命令：
awk -F ':' '{print "userName:" $1}' /etc/passwd  #输出用户名
awk -F '\t' '{}' 以tab作为分隔符
awk -F '|' '{}' 以|作为分隔符
```
##### awk文本头、尾表达式
```
BEGIN ：在编辑语句开始执行之前运行；
END：在所有编辑语句结束之后运行，一般用来书城结束信息、统计数据等；
awk -F:  'BEGIN{print "userName   Num  \n------------"}
{print $1,$2}END{print "--------结束-----------"}'
```

#####  awk的正则、元字符、运算符和关系运算符
```
a、常见的算术运算：
    赋值：x=y
    求和：x+y
    x/y、x*y、++x、？：、x%y ...............

b、关系运算
    > >= < <= != == 
    匹配 admin：~/admin/
    不匹配admin： !~/admin/
```

###### awk正则的使用
```
匹配所有含admin的用户所有信息:
awk '/admin/{print $0}' /etc/passwd 

输出用户名、编号：
awk '/admin/{print $1 "\t" $2}'

精确匹配(==),匹配编号为501的所有用户的所有信息：
awk '$2=="501"{print $0}'

排除包含某个字符匹配,排除编号不为501的用户：
awk '$2!="501"{print $0}''

精确匹配admin：
awk '$1 ~/admin/{print $0}'

不精确匹配admin：
awk '$1 !~/admin/{print $0}'

匹配admin和张三：
awk '$1 /admin|zhangsan/{print $0}'

awk '$1 /^......[5-9]/{print $0}'
awk '$1 ~/(admin|zhangsan)/{print $0}' #匹配其中一个
```

##### 在awk中使用变量
```
    1、内置变量；
        FILENAME：用于保存输入文件的文件名称；
        NF：用于保存当前正在处理记录的域个数；
        NR：用于保存从文本中读取的记录个数；
        FNR：用于保存当前读取的记录数；
        OFS：用于设置输出分隔字段的字符，默认为空格；
        FS：用于设置字段分隔符；
        ORS：用于设置输出记录的分隔符，默认为新的一行；
        RS：用于设置记录分隔符，默认为新行；
        OFMT：数字的输出格式；
        ENVIRON：读取环境比那里。

 2、内置函数：
     print ：输出函数
     。。。。。。。。。。。。。

 3、自定义变量；
     awk -F ':' '{sum=sum+$1}END{print sum}'  #求和
```

#####  awk demo

```
指定分隔符
awk  'BEGIN{FS=":"} {print $1,$3,$6}' /etc/passwd

如果你要指定多个分隔符，你可以这样来：
awk -F '[;:]'

再来看一个以\t作为分隔符输出的例子（下面使用了/etc/passwd文件，这个文件是以:分隔的）：
 awk  -F: '{print $1,$3,$6}' OFS="\t" /etc/passwd

其实awk可以像grep一样的去匹配第一行，就像这样：
awk '/LISTEN/' netstat.txt

我们可以使用 “/FIN|TIME/” 来匹配 FIN 或者 TIME :
awk '$6 ~ /FIN|TIME/ || NR==1 {print NR,$4,$5,$6}' OFS="\t" netstat.txt

awk拆分文件很简单，使用重定向就好了。下面这个例子，是按第6例分隔文件，相当的简单（其中的NR!=1表示不处理表头）:
awk 'NR!=1{print > $6}' netstat.txt

你也可以把指定的列输出到文件：
awk 'NR!=1{print $4,$5 > $6}' netstat.txt

下面的命令计算所有的C文件，CPP文件和H文件的文件大小总和:
ls -l  *.cpp *.c *.h | awk '{sum+=$5} END {print sum}'

再来看看统计每个用户的进程的占了多少内存（注：sum的RSS那一列）:
ps aux | awk 'NR!=1{a[$1]+=$6;} END { for(i in a) print i ", " a[i]"KB";}'

读取文件大小，并使用变量统计所有文件所占用的空间
ls -l | awk 'BEGIN{A=0}{A+=A+$5}END{print "文件所占空间："A}'        

awk分割空格或tab键值输出第一行，第二行，第五行
cat a.txt | awk '{OFS="\t"}{print $1,$2,$5}'

在liguibing文件夹下查找所有php文件包含 10.10.0.9 的文件
grep -R --include="*.php" "10.10.0.9" /home/work/liguibing

求和：
[wiki@cq01-wiki-qaoptest4.vm.baidu.com wikiaudit]$ cat wikiaudit.log |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+" | awk '{sum+=$1}END{print sum}' 
62726 

求平均值：
[wiki@cq01-wiki-qaoptest4.vm.baidu.com wikiaudit]$ cat wikiaudit.log |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+" | awk '{sum+=$1}END{print sum/NR}' 
120.395 

cat wikiaudit.log.201412* | grep -P -o "AuditAreaTimeCount\[[^\]]+\]" | grep -P -o "\[[^\]]+\]"

影响行数：
[wiki@cq01-wiki-qaoptest4.vm.baidu.com wikiaudit]$ cat wikiaudit.log |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+" | wc -l 
521 

输出所有匹配的数值：
cat wikiaudit.log |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+" | less
或者：
cat wikiaudit.log |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+"

线上mis机器：
ssh cp01-wiki-mis00.cp01
cat wikiaudit.log.2014081415 |grep "wikiaudit/diff" | grep -P -o "cost\[\d+\]" | grep -P -o "\d+"

awk分割空格或tab键值输出第一行，第二行，第五行
cat a.txt | awk '{OFS="\t"}{print $1,$2,$5}'

从file文件中找出长度大于80的行
awk 'length>80' file
 
按连接数查看客户端IP
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr
 
打印99乘法表
seq 9 | sed 'H;g' | awk -v RS='' '{for(i=1;i<=NF;i++)printf("%dx%d=%d%s", i, NR, i*NR, i==NR?"\n":"\t")}'

```


### sed简明教程
```
##### sed语法
* sed -选项 指令 文件
* sed -选项 -f 指令文件 要处理的文件   注意：这种方式适合于命令比较复杂，把命令放入文件中

##### sed常用选项
* n：不输出所有行，默认输出所有行，定位行
* e：后面有多个命令时使用，相当于 ｜ grep
* f：指定有命令的脚本

##### sed常用定位
* m,n :表示一个行号的范围
* m,n:排除地m到n行
* /abc/: 匹配ABC所有行

##### sed常用编辑指令
* sed -n '3p'     a.txt 输出第3行
* sed -n '3,5p'  a.txt 输出3-5行
* sed -n '/abc/p'  a.txt  匹配所有含ABC的行
* sed -n '/abc/=' a.txt  匹配显示ABC对应的行号
* sed '/abc/d' a.txt  删除含ABC的所有行
* cat -v a.txt  查看所有字符，如 ^M
* sed 's/^M//g' a.txt  删除^M特殊字符

#####  sed批量替换
* sed -i "s/控制面板/飞吧后台管理系统/g" `grep 控制面板 -rl /data/webroot/wwwroot/admin/resources/views`   将控制面板替换为：飞吧后台管理系统，替换views下的所有文件
* sed -i "s/字符串/要替换的字符/g" `grep 字符串 -rl /mnt/webroot/admin/laravel5.3-admin`
```

### crontab [-u username] [-l|-e|-r]
```
* 代表意義	分鐘	小時	日期	月份	週	指令
* 數字範圍	0-59	0-23	1-31	1-12	0-7	呀就指令啊

### dmoe
* 58   *   *   *   *   cd /home/wiki/odp/app/operation/script/starflower && /home/wiki/odp/php/bin/php ExportRankListCategory.php > /dev/null 2>&1
* 10  1   *   *   *   cd /home/wiki/odp/app/operation/script/starflower && /home/wiki/odp/php/bin/php ExportRankList.php total > /dev/null 2>&1 

### 文件锁
* */5 * * * * flock -xn /home/work/liguibing/test/a.lock -c 'php a.php' #每5分钟执行一次
* 执行php程序命令前添加php的进程锁，会在 /home/work/liguibing/test/目录下产生
* 一个a.lock的锁文件，crontab执行a.php脚本，php会检测a.lock的锁文件是否存在，如
* 果存在说明之前的同步还未完成，则不执行本次的a.php程序，直到上次a.php完成后，
* crontab里的脚本才会执行a.php同步。
* 注意：如果是shell脚本，方法同样适用
* */5 * * * * flock -xn /home/work/yuna/lock/rsync_pull_47.lock -c 'sh /home/work/yuna/rsync_pull_47.sh >/dev/null 2>&1 &'

```

### 打印每一重复行出现的次数,“uniq -c”表示标记出重复数量
	cat access_log | awk '{print $1}'| sort | uniq -c

## Curl 使用

```
#### GET
```
	curl http://123.57.36.107/test.php
	curl -i http://123.57.36.107/test.php
	
	get json:
	curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://123.57.36.107/test.php
	
	get xml:
	curl -H "Accept: application/xml" -H "Content-Type: application/xml" -X GET http://123.57.36.107/test.php

```


#### POST
linux
	普通post请求：
		curl --data "name=admin&age=30" http://123.57.36.107/test.php

	RESTful HTTP Post:
		curl -X POST -d @filename http://123.57.36.107/test.php
		
	For logging into a site (需要登录验证的地址):
		curl -d "username=admin&password=admin&submit=Login" --dump-header headers http://123.57.36.107/login.php
		curl -L -b headers http://123.57.36.107/userInfo.php
		
	curl -X POST -H "AppKey: go9dnk49bkd9jd9vmel1kglw0803mgq3" -H "Nonce: 4tgggergigwow323t23t" -H "CurTime: 1443592222" -H "CheckSum: 9e9db3b6c9abb2e1962cf3e6f7316fcc55583f86" -H "Content-Type: application/x-www-form-urlencoded" -d 'accid=zhangsan&name=Jack' 'https://api.netease.im/nimserver/user/updateUinfo.action'
	
	即：
	curl -X POST -H "头信息01" -H "头信息02" -H “头信息03” -d "参数名称01=值01&参数值02=值02" ‘请求url’


###上传文件
curl --form "fileupload=@/home/wwwroot/default/html.tar.gz"  http://123.57.36.107/test.php
显示上传速度：
curl -O --form "fileupload=@/home/wwwroot/default/html.tar.gz" http://123.57.36.107/test.php

### Usage
	curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/resource | json

```




