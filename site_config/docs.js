export default {
  'en-us': {
    sidemenu: [
      {
        title: 'header title',
        children: [
          {
            title: 'demo1',
            link: '/en-us/docs/demo1.html',
          },
          {
            title: 'demo2',
            link: '/en-us/docs/demo2.html',
          },
          {
            title: 'dir',
            opened: true,
            children: [
              {
                title: 'demo3',
                link: '/en-us/docs/dir/demo3.html',
              },
            ],
          },
        ],
      },
    ],
    barText: 'Documentation',
  },
  'zh-cn': {
    sidemenu: [
      {
        title: '技术专题',
        children: [
          // {
          //   title: '示例1',
          //   link: '/zh-cn/docs/demo1.html',
          // },
          // {
          //   title: '示例2',
          //   link: '/zh-cn/docs/demo2.html',
          // },
          {
            title: 'redis',
            opened: true,
            children: [
              {
                title: '1.Redis从基础到进阶',
                link: '/zh-cn/docs/redis/redis1.html',
              },
              {
                title:'2.Redis主从模式详解',
                link: '/zh-cn/docs/redis/redis2.html',
              },
              {
                title:'3.Redis哨兵机制详解',
                link: '/zh-cn/docs/redis/redis3.html',
              },
              {
                title:'4.Redis高可用集群RedisCluster详解',
                link: '/zh-cn/docs/redis/redis4.html',
              }
            ],
          },
        ],
      },
      {
        title: '面试专题',
        children: [
          // {
          //   title: '示例1',
          //   link: '/zh-cn/docs/demo1.html',
          // },
          // {
          //   title: '示例2',
          //   link: '/zh-cn/docs/demo2.html',
          // },
          // {
          //   title: '目录',
          //   opened: true,
          //   children: [
          //     {
          //       title: '示例3',
          //       link: '/zh-cn/docs/dir/demo3.html',
          //     },
          //   ],
          // },
        ],
      }
    ],
    barText: '文档',
  },
};
