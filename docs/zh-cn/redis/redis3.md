# Redis哨兵机制详解

## 1.哨兵机制(sentinel)的高可用
### 1.1原理
原理：当主节点出现故障时，由Redis Sentinel自动完成故障发现和转移，并通知应用方，实现高可用性。
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-171132@2x.png)
### 1.2哨兵Sentinel的作用
哨兵有三个定时监控任务完成对各节点的发现和监控。
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-171433@2x.png)
#### 哨兵主观下线
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-171642@2x.png)
主观下线后，不准确，不会做故障转移
#### 哨兵客观下线
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-171732@2x.png)
### 1.3哨兵选举流程
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-172122@2x.png)
### 1.4故障转移流程
1.由Sentinel节点定期监控发现主节点是否出现故障
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-202559@2x.png)
sentinel会向master发送心跳PING来确认master是否存活,如果master在"一定时间范围"内不回应PING或者是回复了一个错误消息,那么这个sentinel会主观地(单方面)的认为这个master已经不可用了

2.当主节点出现故障,假设3个Sentinel节点共同选举了Sentinel3为领导者,负责处理主节点的故障转移
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-202723@2x.png)

3.由Sentinel3领导者节点执行故障转移,过程和主从复制一样,但是自动执行
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-202844@2x.png)
4.故障转移后的拓扑结构图
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-202943@2x.png)

5.故障转移详细流程
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-203034@2x.png)
## 2.RedisSentinel安装与部署
这里以3个Sentinel节点,2个从节点,1个主节点为例进行安装和部署
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-203507@2x.png)
### 2.1搭建1主2从的主从复制
	先搭建好一主两从redis的主从复制，和之前复制的搭建一样，搭建方式如下：
	A主节点6379节点（/usr/local/bin/conf/redis6379.conf）：
	      修改 requirepass 12345678，注释掉bind 192.168.42.111 
	B从节点redis6380.conf和redis6381.conf:
	      修改 requirepass 12345678 ,注释掉#bind 192.168.42.111, 
	      加上masterauth 12345678 ,加上slaveof 192.168.42.111 6379
	注意：当主从起来后，主节点可读写，从节点只可读不可写
	
### 2.2哨兵机制核心配置
	redis sentinel哨兵机制配置(也是3个节点)：
	   /usr/local/bin/conf/sentinel_26379.conf  
	   /usr/local/bin/conf/sentinel_26380.conf
	   /usr/local/bin/conf/sentinel_26381.conf
	将三个文件的端口改成: 26379   26380   26381
	sentinel monitor mymaster 192.168.42.111 6379 2  //监听主节点6379
	sentinel auth-pass mymaster 12345678     //连接主节点时的密码
	三个配置除端口外，其它一样
	配完此脚本，哨兵机制可正常启动运行。
 
### 2.3哨兵其他配置
	sentinel monitor mymaster 192.168.42.111 6379 2  //监控主节点的IP地址端口
	sentinel auth-pass mymaster 12345678  //sentinel连主节点的密码
	sentinel config-epoch mymaster 2      //执行故障转移时， 最多可以有多少个从节点同时对新的主节点进行数据同步
	sentinel leader-epoch mymaster 2
	sentinel failover-timeout mymaster 180000 //故障转移超时时间180s，                            
	    a,如果转移超时失败，下次转移时时间为之前的2倍；
	    b,从节点变主节点时，从节点执行slaveof no one命令一直失败的话，当时间超过180S时，则故障转移失败
	    c,从节点复制新主节点时间超过180S转移失败
	sentinel down-after-milliseconds mymaster 300000//sentinel节点定期向主节点ping命令
	
### 2.4RedisSentinel节点测试

	测试：kill -9 6379  杀掉6379的redis服务
	看日志是分配6380 还是6381做为主节点，当6379服务再启动时，已变成从节点
	
	假设6380升级为主节点:
	进入6380>info replication     
	         role:master
	打开sentinel_26379.conf等三个配置，
	     sentinel monitor mymaster 192.168.42.111 6380 2 //有2个sentinel认为master下线
	打开redis6379.conf等三个配置, slaveof 127.0.0.1 6380,也变成了6380
	注意：生产环境建议让redis Sentinel部署到不同的物理机上。
	
	坑点：sentinel monitor mymaster 192.168.42.111 6379 2 
	     //切记将IP不要写成127.0.0.1
	不然使用JedisSentinelPool取jedis连接的时候会变成取127.0.0.1 6379的错误地址

### 2.5RedisSentinel如何监控2个redis主节点
我们以3个Sentinel节点、2个从节点、1个主节点为例进行安装部署
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-000216@2x.png)
原配置加上一句：sentinel monitor mymasterB 192.168.1.112 6379 2

### 3.哨兵的API
	 命令：redis-cli -p 26379  //进入哨兵的命令模式，使用redis-cli进入
	
	  26379> sentinel masters或sentinel master mymaster
	  26379> sentinel slaves mymaster 
	  26379> sentinel sentinels mymaster //查sentinel节点集合(不包括当前26379)
	  26379> sentinel failover mymaster //对主节点强制故障转移，没和其它节点协商
	
	./redis-cli -p 26380 shutdown //关闭


