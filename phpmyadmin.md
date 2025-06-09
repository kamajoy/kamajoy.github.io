### docker 安装之后，增加多个mysql服务
```doc
修改 config.inc.php 文件(一般在 /etc/phpmyadmin目录下面),如果不在etc下可能在 /var/www/html/phpmyadadmin


$cfg['Servers'][1]['verbose'] = "local-db";//定义默认数据库名称

$j=2;
$cfg['Servers'][$j]['host'] = 'polar-dev.rwlb.rds.aliyuncs.com';
$cfg['Servers'][$j]['port'] = '3306';
$cfg['Servers'][$j]['user'] = 'lvweb1';
$cfg['Servers'][$j]['password'] = 'lavion#2013';
$cfg['Servers'][$j]['verbose'] = 'soyoung-db-test';

$j=3;
$cfg['Servers'][$j]['host'] = 'mysql.sy.soyoung.com';
$cfg['Servers'][$j]['port'] = '6033';
$cfg['Servers'][$j]['user'] = 'liguibing_cx';
$cfg['Servers'][$j]['password'] = '5W3kQ6BvlIIx6kR9zHou';
$cfg['Servers'][$j]['verbose'] = 'lgb-soyoung-db-online';

$j=4;
$cfg['Servers'][$j]['host'] = '172.16.16.32';
$cfg['Servers'][$j]['port'] = '6033';
$cfg['Servers'][$j]['user'] = 'liguibing_es_cx';
$cfg['Servers'][$j]['password'] = 'WUTl3wrZWqGcKJwgpsjV';
$cfg['Servers'][$j]['verbose'] = 'lgb-soyoung-db-online-sphinx';


```
