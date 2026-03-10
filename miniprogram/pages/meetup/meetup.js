// pages/meetup/meetup.js
Page({
  data: {
    meetups: [],
    loading: true,
    activeFilter: 'upcoming' // upcoming, past, mine
  },

  onLoad() {
    this.loadMeetups()
  },

  onPullDownRefresh() {
    this.loadMeetups().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadMeetups() {
    this.setData({ loading: true })
    
    // TODO: 从服务器加载
    this.setData({
      meetups: [
        {
          id: 1,
          title: '上海雪茄品鉴会 - Cohiba 专场',
          date: '2024-03-15',
          time: '19:00',
          location: '上海外滩 Cigar Lounge',
          address: '上海市黄浦区外滩18号',
          host: { name: '雪茄俱乐部', avatar: '' },
          participants: 24,
          maxParticipants: 30,
          description: '本次品鉴会将带来多款 Cohiba 经典系列，包括 Siglo 系列和 Behike 系列。',
          tags: ['Cohiba', '品鉴会', '上海'],
          price: 388,
          isJoined: false
        },
        {
          id: 2,
          title: '北京雪茄沙龙 - 新手入门专场',
          date: '2024-03-20',
          time: '14:00',
          location: '北京三里屯 Cigar House',
          address: '北京市朝阳区三里屯路',
          host: { name: '北京茄友会', avatar: '' },
          participants: 18,
          maxParticipants: 25,
          description: '专为雪茄新手设计的入门活动，资深茄友将分享雪茄选择、剪切、点燃技巧。',
          tags: ['新手', '入门', '北京'],
          price: 168,
          isJoined: true
        }
      ],
      loading: false
    })
  },

  handleFilterChange(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({ activeFilter: filter })
    this.loadMeetups()
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/meetup-detail/meetup-detail?id=${id}`
    })
  },

  createMeetup() {
    wx.navigateTo({
      url: '/pages/meetup-create/meetup-create'
    })
  }
})