// pages/journal/journal.js
Page({
  data: {
    journals: [],
    loading: true,
    filterType: 'all' // all, mine, following
  },

  onLoad() {
    this.loadJournals()
  },

  onShow() {
    this.loadJournals()
  },

  onPullDownRefresh() {
    this.loadJournals().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadJournals() {
    this.setData({ loading: true })
    
    // TODO: 从服务器加载
    this.setData({
      journals: [
        {
          id: 1,
          title: 'Cohiba Behike 52 品鉴笔记',
          author: { name: '雪茄客', avatar: '' },
          cigar: { name: 'Cohiba Behike 52', brand: 'Cohiba' },
          rating: 4.8,
          content: '今天品尝了一支存放了三年的 Cohiba Behike 52。点燃后第一口就感受到浓郁的坚果和皮革香气...',
          images: [],
          tags: ['古巴', 'Cohiba', 'Behike'],
          likes: 128,
          comments: 23,
          createdAt: '2024-03-09'
        },
        {
          id: 2,
          title: '多米尼加雪茄初体验',
          author: { name: '老烟枪', avatar: '' },
          cigar: { name: 'Arturo Fuente OpusX', brand: 'Arturo Fuente' },
          rating: 4.6,
          content: '一直以来都在抽古巴雪茄，今天尝试了多米尼加的 OpusX，没想到惊喜不小...',
          images: [],
          tags: ['多米尼加', 'OpusX'],
          likes: 89,
          comments: 15,
          createdAt: '2024-03-08'
        }
      ],
      loading: false
    })
  },

  handleFilterChange(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ filterType: type })
    this.loadJournals()
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/journal-detail/journal-detail?id=${id}`
    })
  },

  createJournal() {
    wx.navigateTo({
      url: '/pages/journal-create/journal-create'
    })
  }
})