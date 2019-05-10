# Redis从基础到进阶
<!-- TOC -->

- [Redis从基础到进阶](#redis从基础到进阶)
    - [1.Redis介绍及入门](#1redis介绍及入门)
        - [1.1 Redis是什么?](#11-redis是什么)
        - [1.2Redis特性](#12redis特性)
        - [1.3使用场景](#13使用场景)
        - [1.4Redis安装](#14redis安装)
        - [1.5Redis配置、启动、操作、关闭](#15redis配置启动操作关闭)
    - [2.Redis数据结构及常用命令](#2redis数据结构及常用命令)
        - [2.1数据结构-字符串(String)](#21数据结构-字符串string)
            - [设值命令](#设值命令)
            - [获值命令](#获值命令)
            - [计数](#计数)
            - [追加](#追加)
        - [2.2数据结构-哈希(hash)](#22数据结构-哈希hash)
        - [2.3数据结构-列表(list)](#23数据结构-列表list)
            - [添加命令：](#添加命令)
            - [查找命令：](#查找命令)
        - [2.4数据结构-集合(Set)](#24数据结构-集合set)
        - [2.5数据结构-有序集合(Zset)](#25数据结构-有序集合zset)
            - [命令](#命令)
            - [应用场景](#应用场景)
            - [与LIST和SET对比](#与list和set对比)
        - [2.6Redis全局命令](#26redis全局命令)
        - [2.7Redis数据库管理](#27redis数据库管理)
    - [3.Redis持久化](#3redis持久化)
        - [3.1RDB持久化](#31rdb持久化)
            - [原理](#原理)
            - [操作](#操作)
        - [3.2AOF持久化](#32aof持久化)
            - [原理](#原理-1)
            - [配置详解](#配置详解)
            - [AOF存储方式](#aof存储方式)
            - [AOF如何恢复](#aof如何恢复)
        - [3.3Redis重启时加载AOF与RDB的顺序？](#33redis重启时加载aof与rdb的顺序)

<!-- /TOC -->
## 1.Redis介绍及入门 
### 1.1 Redis是什么?
Redis是一个开源的使用ANSI C语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value数据库，并提供多种语言的API
1，Redis安装在磁盘；
2，Redis数据存储在内存。
### 1.2Redis特性
redis是一种基于键值对（key-value）数据库，其中value可以为string、hash、list、set、zset等多种数据结构，可以满足很多应用场景。还提供了键过期，发布订阅，事务，流水线等附加功能.    
特性：  
1〉速度快  
2〉键值对的数据结构服务器  
3〉丰富的功能：  
4〉简单稳定  
5〉持久化  
6〉主从复制  
8〉高可用和分布式转移  
9〉客户端语言多  
### 1.3使用场景
1，缓存数据库    
2，排行榜  
3，计数器应用  
4，社交网络  
5，消息队列  
### 1.4Redis安装
此处不在详细编写,可直接百度
### 1.5Redis配置、启动、操作、关闭

| 可执行文件  | 作用 |
|:------------- |:---------------:|
| redis-server      | 启动redis |
| redis-cli      | redis命令行客户端 |
| redis-benchmark | 基准测试工具 |
| redis-check-aof      | AOF持久化文件检测和修复工具 |
| redis-check-dump     | RDB持久化文件检测和修复工具 |
| redis-sentinel | 启动哨兵 |
| redis-trib | cluster集群构建工具 |



## 2.Redis数据结构及常用命令
### 2.1数据结构-字符串(String)
字符串类型：实际上可以是字符串（包括XML JSON），还有数字（整形 浮点数），二进制（图片 音频 视频），最大不能超过512MB.  
#### 设值命令 
set age 23 ex 10  //10秒后过期  px 10000 毫秒过期  
setnx name test  //不存在键name时，返回1设置成功；存在的话失败0  
set age 25 xx      //存在键age时，返回1成功  
#### 获值命令  
get age //存在则返回value, 不存在返回null  
批量设值：mset country china city beijing  
批量获取：mget country city address //返回china  beigjin, address为nil
#### 计数
incr age //必须为整数自加1，非整数返回错误，无age键从0自增返回1  
decr age //整数age减1  
incrby age 2 //整数age+2  
decrby age 2//整数age -2  
incrbyfloat score 1.1 //浮点型score+1.1  
#### 追加
append追加指令：  
set name hello; append name world //追加后成helloworld  
字符串长度：  
set hello “世界”；strlen hello//结果6，每个中文占3个字节  
截取字符串：  
set name helloworld ; getrange name 2 4//返回 llo  

### 2.2数据结构-哈希(hash)
哈希hash是一个string类型的field和value的映射表，hash特适合用于存储对象  
命令  hset key field value  
设值：hset user:1 name james         //成功返回1，失败返回0    
取值：hget user:1 name              //返回james  
删值：hdel user:1 age               //返回删除的个数  
计算个数：hset user:1 name james; hset user:1 age 23;   
         hlen user:1  //返回2，user:1有两个属性值  
批量设值：hmset user:2 name james age 23 sex boy //返回OK  
批量取值：hmget user:2 name age sex  //返回三行：james 23 boy  
判断field是否存在：hexists user:2 name //若存在返回1，不存在返回0  
获取所有field: hkeys user:2    // 返回name age sex三个field  
获取user:2所有value：hvals user:2     // 返回james 23 boy  
获取user:2所有field与value：hgetall user:2 //name age sex james 23 boy值  
增加1：hincrby user:2 age 1      //age+1  
      hincrbyfloat user:2 age 2   //浮点型加2  

使用hash类型存储数据  
hmset user:1 name james age 23 sex boy
   优点：简单直观，使用合理可减少内存空间消耗
   缺点：要控制ziplist与hashtable两种编码转换，且hashtable会消耗更多内存erialize(userInfo);
   
### 2.3数据结构-列表(list)
用来存储多个有序的字符串，一个列表最多可存2的32次方减1个元素
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-153505@2x.png)
因为有序，可以通过索引下标获取元素或某个范围内元素列表，
列表元素可以重复
#### 添加命令：
rpush james c b a //从右向左插入cba, 返回值3    
lrange james 0 -1 //从左到右获取列表所有元素 返回 c b a  
lpush key c b a //从左向右插入cba  
linsert james before b teacher //在b之前插入teacher, after为之后，使用lrange james 0 -1 查看：c teacher b a  
 

#### 查找命令：
lrange key start end //索引下标特点：从左到右为0到N-1  
lindex james -1 //返回最右末尾a，-2返回b  
llen james        //返回当前列表长度  
lpop james       //把最左边的第一个元素c删除  
rpop james      //把最右边的元素a删除  
### 2.4数据结构-集合(Set)
用户标签，社交，查询有共同兴趣爱好的人,智能推荐
保存多元素，与列表不一样的是不允许有重复元素，且集合是无序，一个集合最多可存2的32次方减1个元素，除了支持增删改查，还支持集合交集、并集、差集；
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-153849@2x.png)

exists user    //检查user键值是否存在  
sadd user a b c//向user插入3个元素，返回3  
sadd user a b  //若再加入相同的元素，则重复无效，返回0  
smember user //获取user的所有元素,返回结果无序  
srem user a   //返回1，删除a元素  
scard user    //返回2，计算元素个数  
### 2.5数据结构-有序集合(Zset)
常用于排行榜，如视频网站需要对用户上传视频做排行榜，或点赞数
与集合有联系，不能有重复的成员
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-154121@2x.png)

#### 命令
指令：     
   zadd key score member [score member......]  
   zadd user:zan 200 james //james的点赞数1, 返回操作成功的条数1  
   zadd user:zan 200 james 120 mike 100 lee// 返回3   
   zadd test:1 nx 100 james   //键test:1必须不存在，主用于添加  
   zadd test:1 xx incr 200 james   //键test:1必须存在，主用于修改,此时为300  
   zadd test:1 xx ch incr -299 james //返回操作结果1，300-299=1    
   zrange test:1 0 -1 withscores  //查看点赞（分数）与成员名  
   zcard test:1     //计算成员个数， 返回1  
排名场景：  
   zadd user:3 200 james 120 mike 100 lee//先插入数据  
   zrange user:3 0 -1 withscores //查看分数与成员  
  zrank user:3 james  //返回名次：第3名返回2，从0开始到2，共3名    
  zrevrank user:3 james //返回0， 反排序，点赞数越高，排名越前  
#### 应用场景
排行榜系统，如视频网站需要对用户上传的视频做排行榜  
   点赞数：  
           zadd user:1:20180106 3 mike  //mike获得3个赞  
   再获一赞：  
           zincrby user:1:20180106 1 mike  //在3的基础上加1  
   用户作弊，将用户从排行榜删掉：  
           zrem user:1:20180106 mike  
   展示赞数最多的5个用户：  
           zrevrangebyrank user:1:20180106  0  4   
   查看用户赞数与排名：  
           zscore user:1:20180106 mike   zrank user:1:20180106 mike  
#### 与LIST和SET对比
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-154307@2x.png)
### 2.6Redis全局命令
   1，查看所有键：  
             keys *   set school enjoy   set hello world  
   2，键总数 ：  
             dbsize       //2个键，如果存在大量键，线上禁止使用此指令  
   3，检查键是否存在：  
             exists key  //存在返回1，不存在返回0  
   4，删除键：  
             del key      //del hello school, 返回删除键个数，删除不存在键返回0  
   5，键过期：  
             expire key seconds        //set name test  
             expire name 10,表示10秒过期  
             ttl key                            // 查看剩余的过期时间  
   6，键的数据结构类型：  
             type key //type hello     //返回string,键不存在返回none  
### 2.7Redis数据库管理
select 0    选择第一个数据库  
flushdb     清空当前数据库数据  
flushall    清空所有数据库数据  
dbsize      返回当前数据库Key的数量
## 3.Redis持久化
redis是一个支持持久化的内存数据库,也就是说redis需要经常将内存中的数据同步到磁盘来保证持久化，持久化可以避免因进程退出而造成数据丢失.  
redis持久化有两种方式 RDB和AOF.  
### 3.1RDB持久化
#### 原理
RDB持久化把当前进程数据生成快照（.rdb）文件保存到硬盘的过程，有手动触发和自动触发.  
   手动触发有save和bgsave两命令   
   save命令：阻塞当前Redis，直到RDB持久化过程完成为止，若内存实例比较大会造成长时间阻塞，线上环境不建议用它  
   bgsave命令：redis进程执行fork操作创建子线程，由子线程完成持久化，阻塞时间很短（微秒级），是save的优化,在执行redis-cli shutdown关闭redis服务时，如果没有开启AOF持久化，自动执行bgsave;  
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-160510@2x.png)
#### 操作
命令：config set dir /usr/local  //设置rdb文件保存路径  
备份：bgsave  //将dump.rdb保存到usr/local下  
恢复：将dump.rdb放到redis安装目录与redis.conf同级目录，重启redis即可  
优点：   
1，压缩后的二进制文，适用于备份、全量复制，用于灾难恢复  
2，加载RDB恢复数据远快于AOF方式    
缺点：
1，无法做到实时持久化，每次都要创建子进程，频繁操作成本过高    
2，保存后的二进制文件，存在老版本不兼容新版本rdb文件的问题  
### 3.2AOF持久化
针对RDB不适合实时持久化，redis提供了AOF持久化方式来解决  
开启：redis.conf设置：appendonly yes  (默认不开启，为no)  
默认文件名：appendfilename "appendonly.aof"    
#### 原理
流程说明：  
 1，所有的写入命令(set hset)会append追加到aof_buf缓冲区中    
 2，AOF缓冲区向硬盘做sync同步  
 3，随着AOF文件越来越大，需定期对AOF文件rewrite重写，达到压缩  
 4，当redis服务重启，可load加载AOF文件进行恢复  
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-161424@2x.png)
命令写入(append), 文件同步(sync), 文件重写(rewrite), 重启加载(load)  
#### 配置详解
appendonly yes           //启用aof持久化方式  
// appendfsync always //每收到写命令就立即强制写入磁盘，最慢的，但是保证完全的持久化，不推荐使用  
appendfsync everysec //每秒强制写入磁盘一次，性能和持久化方面做了折中，推荐  
// appendfsync no         //完全依赖os，性能最好,持久化没保证（操作系统自身的同步）  
no-appendfsync-on-rewrite  yes  //正在导出rdb快照的过程中,要不要停止同步aof  
auto-aof-rewrite-percentage 100  //aof文件大小比起上次重写时的大小,增长率100%时,重写  
auto-aof-rewrite-min-size 64mb   //aof文件,至少超过64M时,重写  
#### AOF存储方式
AOF文件存储使用RESP协议
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-163822@2x.png)
#### AOF如何恢复
1. 设置appendonly yes；
2. 将appendonly.aof放到dir参数指定的目录；
3. 启动Redis，Redis会自动加载appendonly.aof文件。

### 3.3Redis重启时加载AOF与RDB的顺序？
1，当AOF和RDB文件同时存在时，优先加载AOF  
2，若关闭了AOF，加载RDB文件  
3，加载AOF/RDB成功，redis重启成功  
4，AOF/RDB存在错误，启动失败打印错误信息  
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-161920@2x.png)
