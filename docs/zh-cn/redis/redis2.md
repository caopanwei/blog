# Redis主从模式详解

## 1.Redis主从模式
### 1.1主从复制命令
   a,方式一、新增redis6380.conf, 加入  slaveof 192.168.42.111 6379,  在6379启动完后再启6380，完成配置；  
   b,方式二、redis-server --slaveof 192.168.42.111 6379  
   c,查看状态：info replication  
   d,断开主从复制：在slave节点，执行6380:>slaveof no one  
   e,断开后再变成主从复制：6380:> slaveof 192.168.42.111 6379  
   f,数据较重要的节点，主从复制时使用密码验证： requirepass  
   e,从节点建议用只读模式slave-read-only=yes, 若从节点修改数据，主从数据不一致         
### 1.2Redis主从拓扑
#### 一主一从
用于主节点故障转移从节点，当主节点的“写”命令并发高且需要持久化，可以只在从节点开启AOF（主节点不需要）
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-165257@2x.png)
#### 一主多从
针对“读”较多的场景，“读”由多个从节点来分担，但节点越多，主节点同步到多节点的次数也越多，影响带宽，也加重主节点的稳定
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-165308@2x.png)
#### 树状主从
一主多从的缺点（主节点推送次数多压力大）可用些方案解决，主节点只推送一次数据到从节点1，再由从节点2推送到11，减轻主节点推送的压力
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-165308@2x.png)
### 1.3主从原理
执行slave master port后，与主节点连接，同步主节点的数据,6380:>info replication：查看主从及同步信息 
![](https://gitee.com/cpw/commonimage/raw/master/QQ20190420-165329@2x.png)
### 1.4数据同步
redis 2.8版本以上使用psync命令完成同步，过程分“全量”与“部分”复制  
全量复制：  
一般用于初次复制场景（第一次建立SLAVE后全量）  
部分复制：  
网络出现问题，从节点再次连主时，主节点补发缺少的数据，每次数据增加同步  
心跳：  
主从有长连接心跳，主节点默认每10S向从节点发ping命令，repl-ping-slave-period控制发送频率 
### 1.5缺点
1. 主从复制，若主节点出现问题，则不能提供服务，需要人工修改配置将从变主.
2. 主从复制主节点的写能力单机，能力有限.  
3. 需要人工干预，无法实现高可用.  
