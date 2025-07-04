### docker 安装之后，增加多个mysql服务
```doc
修改 config.inc.php 文件(一般在 /etc/phpmyadmin目录下面),如果不在etc下可能在 /var/www/html/phpmyadadmin


$cfg['Servers'][1]['verbose'] = "local-db";//定义默认数据库名称

$j=2;
$cfg['Servers'][$j]['host'] = 'xxxxx';
$cfg['Servers'][$j]['port'] = '3306';
$cfg['Servers'][$j]['user'] = 'xxx';
$cfg['Servers'][$j]['password'] = 'lxxxxxxx';
$cfg['Servers'][$j]['verbose'] = 'xxxxxtest';

$j=3;
$cfg['Servers'][$j]['host'] = 'xxx.sy.xxx.com';
$cfg['Servers'][$j]['port'] = '6033';
$cfg['Servers'][$j]['user'] = 'xxxx';
$cfg['Servers'][$j]['password'] = 'xxxx';
$cfg['Servers'][$j]['verbose'] = 'xxx-xxxx';

$j=4;
$cfg['Servers'][$j]['host'] = 'xxxx';
$cfg['Servers'][$j]['port'] = '6033';
$cfg['Servers'][$j]['user'] = 'xxxx';
$cfg['Servers'][$j]['password'] = 'xxxx';
$cfg['Servers'][$j]['verbose'] = 'lxxxxx-xxx';


```
