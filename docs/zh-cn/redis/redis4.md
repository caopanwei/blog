# Redis高可用集群RedisCluster详解

## 1.简介及原理
### 1.1什么是RedisCluster?
RedisCluster是Redis的分布式解决方案，在3.0版本后推出的方案，有效地解决了Redis分布式的需求，当遇到单机内存、并发等瓶颈时，可使用此方案来解决这些问题.  
### 1.2分布式数据库概念
分布式数据库把整个数据按分区规则映射到多个节点，即把数据划分到多个节点上，每个节点负责整体数据的一个子集 
### 1.3分区规则
常见的分区规则哈希分区和顺序分区，redis集群使用了哈希分区，顺序分区暂用不到，不做具体说明；  
RedisCluster采用了哈希分区的“虚拟槽分区”方式（哈希分区分节点取余、一致性哈希分区和虚拟槽分区）。
### 1.4虚拟槽分区
槽：slot  
RedisCluster采用此分区，所有的键根据哈希函数(CRC16[key]&16383)映射到0－16383槽内，共16384个槽位，每个节点维护部分槽及槽所映射的键值数据  
哈希函数: Hash()=CRC16[key]&16383
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-001156@2x.png)
### 1.5槽、键、数据关系
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-091843@2x.png)
### 1.6RedisCluster的缺陷
1. 键的批量操作支持有限，比如mset, mget，如果多个键映射在不同的槽，就不支持了   mset name james age 19
2. 键事务支持有限，当多个键分布在不同节点时无法使用事务，同一节点是支持事务
3. 键是数据分区的最小粒度，不能将一个很大的键值对映射到不同的节点
4. 不支持多数据库，只有0，select 0
5. 复制结构只支持单层结构，不支持树型结构。

## 2.集群环境搭建
6389为6379的从节点，6390为6380的从节点，6391为6381的从节点
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-092415@2x.png)

1. 修改配置  
分别修改6379、 6380、 7381、 6389、 6390、 6391配置文件

		以6379为例：
		 port 6379                      //节点端口
		   cluster-enabled yes              //开启集群模式
		   cluster-node-timeout 15000       //节点超时时间
		   cluster-config-file  /usr/local/bin/clustercon/data/nodes-6379.conf 
集群内部配置文件,其它节点的配置和这个一致，改端口即可  

2. 服务启动  
分别启动redis6379、6380、6381、 6389、 6390、 6391节点

		./redis-server clusterconf/redis6379.conf &
		./redis-server clusterconf/redis6380.conf &
		./redis-server clusterconf/redis6381.conf &
		./redis-server clusterconf/redis6389.conf &
		./redis-server clusterconf/redis6390.conf &
		./redis-server clusterconf/redis6391.conf &

3. 集群启动

	启动命令:

		src/redis-cli --cluster create 10.211.55.5:6379 10.211.55.5:6389 10.211.55.5:6380  10.211.55.5:6390  10.211.55.5:6381 10.211.55.5:6391 --cluster-replicas 1
		//cluster-replicas 1 表示1主1从 ,配置多从可以修改该配置
       
	执行成功后截图:  

		[root@master redis-5.0.4]# src/redis-cli --cluster create 10.211.55.5:6379 10.211.55.5:6389 10.211.55.5:6380  10.211.55.5:6390  10.211.55.5:6381 10.211.55.5:6391 --cluster-replicas 1
		>>> Performing hash slots allocation on 6 nodes...
		Master[0] -> Slots 0 - 5460
		Master[1] -> Slots 5461 - 10922
		Master[2] -> Slots 10923 - 16383
		Adding replica 10.211.55.5:6381 to 10.211.55.5:6379
		Adding replica 10.211.55.5:6391 to 10.211.55.5:6389
		Adding replica 10.211.55.5:6390 to 10.211.55.5:6380
		>>> Trying to optimize slaves allocation for anti-affinity
		[WARNING] Some slaves are in the same host as their master
		M: 3b0dadbb21f6fa82d02bc38633b13dedf1069a24 10.211.55.5:6379
		   slots:[0-5460] (5461 slots) master
		M: f55911e14d10853af291205a73473e02818b9f89 10.211.55.5:6389
		   slots:[5461-10922] (5462 slots) master
		M: a2f83baaa1045c3efdce704b0a4ade1bd7412ad5 10.211.55.5:6380
		   slots:[10923-16383] (5461 slots) master
		S: c00501b56bd4df4ea5edde0e48bfbe0006f9dd21 10.211.55.5:6390
		   replicates f55911e14d10853af291205a73473e02818b9f89
		S: 08738cf9c06d079c47d525d080e7befbc12cc69b 10.211.55.5:6381
		   replicates a2f83baaa1045c3efdce704b0a4ade1bd7412ad5
		S: 4306adfa4f38f60a4c367544adc9717b5aa7215c 10.211.55.5:6391
		   replicates 3b0dadbb21f6fa82d02bc38633b13dedf1069a24
		Can I set the above configuration? (type 'yes' to accept): yes
		>>> Nodes configuration updated
		>>> Assign a different config epoch to each node
		>>> Sending CLUSTER MEET messages to join the cluster
		Waiting for the cluster to join
		...
		>>> Performing Cluster Check (using node 10.211.55.5:6379)
		M: 3b0dadbb21f6fa82d02bc38633b13dedf1069a24 10.211.55.5:6379
		   slots:[0-5460] (5461 slots) master
		   1 additional replica(s)
		M: a2f83baaa1045c3efdce704b0a4ade1bd7412ad5 10.211.55.5:6380
		   slots:[10923-16383] (5461 slots) master
		   1 additional replica(s)
		M: f55911e14d10853af291205a73473e02818b9f89 10.211.55.5:6389
		   slots:[5461-10922] (5462 slots) master
		   1 additional replica(s)
		S: 4306adfa4f38f60a4c367544adc9717b5aa7215c 10.211.55.5:6391
		   slots: (0 slots) slave
		   replicates 3b0dadbb21f6fa82d02bc38633b13dedf1069a24
		S: c00501b56bd4df4ea5edde0e48bfbe0006f9dd21 10.211.55.5:6390
		   slots: (0 slots) slave
		   replicates f55911e14d10853af291205a73473e02818b9f89
		S: 08738cf9c06d079c47d525d080e7befbc12cc69b 10.211.55.5:6381
		   slots: (0 slots) slave
		   replicates a2f83baaa1045c3efdce704b0a4ade1bd7412ad5
		[OK] All nodes agree about slots configuration.
		>>> Check for open slots...
		>>> Check slots coverage...
		[OK] All 16384 slots covered.
		[root@master redis-5.0.4]#
	
4. 集群检测  
	1.检测集群状态slots详细分配
		
		执行命令:
		src/redis-cli --cluster check 10.211.55.5:6379
		
		打印结果如下:
		[root@master redis-5.0.4]# src/redis-cli --cluster info 10.211.55.5:6379
		10.211.55.5:6379 (3b0dadbb...) -> 0 keys | 5461 slots | 1 slaves.
		10.211.55.5:6380 (a2f83baa...) -> 0 keys | 5461 slots | 1 slaves.
		10.211.55.5:6389 (f55911e1...) -> 0 keys | 5462 slots | 1 slaves.
		
	2.检查集群状态
	
		执行命令:
		src/redis-cli --cluster info 10.211.55.5:6379
		
		打印结果如下:
		[root@master redis-5.0.4]# src/redis-cli --cluster check 10.211.55.5:6379
		10.211.55.5:6379 (3b0dadbb...) -> 0 keys | 5461 slots | 1 slaves.
		10.211.55.5:6380 (a2f83baa...) -> 0 keys | 5461 slots | 1 slaves.
		10.211.55.5:6389 (f55911e1...) -> 0 keys | 5462 slots | 1 slaves.
		[OK] 0 keys in 3 masters.
		0.00 keys per slot on average.
		>>> Performing Cluster Check (using node 10.211.55.5:6379)
		M: 3b0dadbb21f6fa82d02bc38633b13dedf1069a24 10.211.55.5:6379
		   slots:[0-5460] (5461 slots) master
		   1 additional replica(s)
		M: a2f83baaa1045c3efdce704b0a4ade1bd7412ad5 10.211.55.5:6380
		   slots:[10923-16383] (5461 slots) master
		   1 additional replica(s)
		M: f55911e14d10853af291205a73473e02818b9f89 10.211.55.5:6389
		   slots:[5461-10922] (5462 slots) master
		   1 additional replica(s)
		S: 4306adfa4f38f60a4c367544adc9717b5aa7215c 10.211.55.5:6391
		   slots: (0 slots) slave
		   replicates 3b0dadbb21f6fa82d02bc38633b13dedf1069a24
		S: c00501b56bd4df4ea5edde0e48bfbe0006f9dd21 10.211.55.5:6390
		   slots: (0 slots) slave
		   replicates f55911e14d10853af291205a73473e02818b9f89
		S: 08738cf9c06d079c47d525d080e7befbc12cc69b 10.211.55.5:6381
		   slots: (0 slots) slave
		   replicates a2f83baaa1045c3efdce704b0a4ade1bd7412ad5
		[OK] All nodes agree about slots configuration.
		>>> Check for open slots...
		>>> Check slots coverage...
		[OK] All 16384 slots covered.
		[root@master redis-5.0.4]#
		
		
5. Redis集群命令	

		[root@master redis-5.0.4]# src/redis-cli --cluster help
		Cluster Manager Commands:
		  create         host1:port1 ... hostN:portN
		                 --cluster-replicas <arg>
		  check          host:port
		                 --cluster-search-multiple-owners
		  info           host:port
		  fix            host:port
		                 --cluster-search-multiple-owners
		  reshard        host:port
		                 --cluster-from <arg>
		                 --cluster-to <arg>
		                 --cluster-slots <arg>
		                 --cluster-yes
		                 --cluster-timeout <arg>
		                 --cluster-pipeline <arg>
		                 --cluster-replace
		  rebalance      host:port
		                 --cluster-weight <node1=w1...nodeN=wN>
		                 --cluster-use-empty-masters
		                 --cluster-timeout <arg>
		                 --cluster-simulate
		                 --cluster-pipeline <arg>
		                 --cluster-threshold <arg>
		                 --cluster-replace
		  add-node       new_host:new_port existing_host:existing_port
		                 --cluster-slave
		                 --cluster-master-id <arg>
		  del-node       host:port node_id
		  call           host:port command arg arg .. arg
		  set-timeout    host:port milliseconds
		  import         host:port
		                 --cluster-from <arg>
		                 --cluster-copy
		                 --cluster-replace
		  help
		
		For check, fix, reshard, del-node, set-timeout you can specify the host and port of any working node in the cluster.
		
		[root@master redis-5.0.4]#
		
		// add-node 新增节点
		@新增主节点
		>redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000
		将新节点的地址指定为第一个参数，并将集群中随机存在节点的地址指定为第二个参数
		>使用reshard命令对该主节点分配哈希槽
		@新增从节点
		redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000 --cluster-slave //随机添加到从节点较少的主节点上
		redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000 --cluster-slave --cluster-master-id 3c3a0c74aae0b56170ccb03a76b60cfe7dc1912e  //指定添加为该主节点id的从节点
		@主节点转化为从节点
		登录该主节点,执行以下命令即可转为该节点id的从节点
		redis 127.0.0.1:7006> cluster replicate 3c3a0c74aae0b56170ccb03a76b60cfe7dc1912e
		
		// del-node 删除从节点
		redis-cli --cluster del-node 127.0.0.1:7000 `<node-id>`
		第一个参数只是集群中的随机节点，第二个参数是要删除的节点的ID。

## 3.集群节点通信－Gossip协议
1. 什么是gossip协议  
节点之间采用Gossip协议进行通信，Gossip协议就是指节点彼此之间不断通信交换信息
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-231609@2x.png)
当主从角色变化或新增节点，彼此通过ping/pong进行通信知道全部节点的最新状态并达到集群同步

2. gossip协议的作用  
Gossip协议的主要职责就是信息交换，信息交换的载体就是节点之间彼此发送的Gossip消息，常用的Gossip消息有ping消息、pong消息、meet消息、fail消息  
meet消息：用于通知新节点加入，消息发送者通知接收者加入到当前集群，meet消息通信完后，接收节点会加入到集群中，并进行周期性ping pong交换  
ping消息：集群内交换最频繁的消息，集群内每个节点每秒向其它节点发ping消息，用于检测节点是在在线和状态信息，ping消息发送封装自身节点和其他节点的状态数据；  
pong消息，当接收到ping meet消息时，作为响应消息返回给发送方，用来确认正常通信，pong消息也封闭了自身状态数据；  
fail消息：当节点判定集群内的另一节点下线时，会向集群内广播一个fail消息  
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-231621@2x.png)

3. gossip协议的消息解析流程
以上的所有消息格式为：消息头、消息体，消息头包含发送节点自身状态数据（比如节点ID、槽映射、节点角色、是否下线等），接收节点根据消息头可以获取到发送节点的相关数据。
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-231637@2x.png)

4. 选择节点后并发关ping消息
Gossip协议信息的交换机制具有天然的分布式特性，但ping pong发送的频率很高
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190421-231649@2x.png)


