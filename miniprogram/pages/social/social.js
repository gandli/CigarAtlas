// pages/social/social.js
Page({
  data: {
    topics: [],
    loading: true,
    activeTab: 'hot' // hot, new, following
  },

  onLoad() {
    this.loadTopics()
  },

  onPullDownRefresh() {
    this.loadTopics().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadTopics() {
    this.setData({ loading: true })
    
    // TODO: 从服务器加载
    this.setData({
      topics: [
        {
          id: 1,
          title: '新手入门：第一支雪茄怎么选？',
          author: { name: '资深茄客', avatar: '' },
          content: '作为一个刚入坑的新手，想请教各位大佬，第一支雪茄应该怎么选择？预算大概在200-300左右...',
          replies: 89,
          views: 1280,
          lastReply: '2024-03-09',
          isHot: true
        },
        {
          id: 2,
          title: '古巴 vs 多米尼加：你更喜欢哪个产地？',
          author: { name: '雪茄猎人', avatar: '' },
          content: '抽了这么多年雪茄，一直在古巴和多米尼加之间纠结。古巴的复杂度和多米尼加的稳定...',
          replies: 156,
          views: 2340,
          lastReply: '2024-03-08',
          isHot: true
        },
        {
          id: 3,
          title: '分享我的雪茄保湿柜配置',
          author: { name: '收藏家', avatar: '' },
          content: '折腾了半年，终于把我的雪茄柜配置搞定了。用的新风系统+电子恒湿，分享一下经验...',
          replies: 67,
          views: 890,
          lastReply: '2024-03-07',
          isHot: false
        }
      ],
      loading: false
    })
  },

  handleTabChange(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ activeTab: tab })
    this.loadTopics()
  },

  navigateToTopic(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    })
  },

  createTopic() {
    wx.navigateTo({
      url: '/pages/topic-create/topic-create'
    })
  }
})