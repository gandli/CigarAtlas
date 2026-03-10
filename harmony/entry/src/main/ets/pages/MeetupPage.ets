/**
 * 本地聚会页面
 * 发现和参与雪茄爱好者聚会
 */
interface Meetup {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  host: string;
  status: 'upcoming' | 'ongoing' | 'ended';
}

@Entry
@Component
struct MeetupPage {
  @State meetups: Meetup[] = [
    {
      id: '1',
      title: '周末雪茄品鉴会',
      location: '上海市静安区某雪茄吧',
      date: '2024-01-20',
      time: '14:00 - 18:00',
      participants: 12,
      maxParticipants: 20,
      host: '雪茄俱乐部',
      status: 'upcoming'
    },
    {
      id: '2',
      title: '古巴雪茄文化交流',
      location: '北京市朝阳区某高端会所',
      date: '2024-01-25',
      time: '19:00 - 22:00',
      participants: 8,
      maxParticipants: 15,
      host: '古巴雪茄协会',
      status: 'upcoming'
    },
    {
      id: '3',
      title: '新手入门分享会',
      location: '深圳市南山区某咖啡厅',
      date: '2024-01-18',
      time: '15:00 - 17:00',
      participants: 15,
      maxParticipants: 15,
      host: '雪茄新手群',
      status: 'ended'
    }
  ];

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('聚会')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Button('创建聚会')
          .fontSize(14)
          .height(32)
          .backgroundColor('#007DFF')
          .borderRadius(16)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 筛选标签
      Row() {
        Text('全部')
          .fontSize(14)
          .fontColor('#fff')
          .backgroundColor('#007DFF')
          .borderRadius(16)
          .padding({ left: 16, right: 16, top: 6, bottom: 6 })

        Text('即将开始')
          .fontSize(14)
          .fontColor('#666')
          .backgroundColor('#f5f5f5')
          .borderRadius(16)
          .padding({ left: 16, right: 16, top: 6, bottom: 6 })
          .margin({ left: 12 })

        Text('已结束')
          .fontSize(14)
          .fontColor('#666')
          .backgroundColor('#f5f5f5')
          .borderRadius(16)
          .padding({ left: 16, right: 16, top: 6, bottom: 6 })
          .margin({ left: 12 })
      }
      .width('100%')
      .padding({ left: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 聚会列表
      List({ space: 12 }) {
        ForEach(this.meetups, (meetup: Meetup) => {
          ListItem() {
            MeetupCard({ meetup: meetup })
          }
        }, (meetup: Meetup) => meetup.id)
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ left: 16, right: 16, top: 12 })
      .backgroundColor('#fafafa')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#fafafa')
  }
}

/**
 * 聚会卡片
 */
@Component
struct MeetupCard {
  @Prop meetup: Meetup = { id: '', title: '', location: '', date: '', time: '', participants: 0, maxParticipants: 0, host: '', status: 'upcoming' };

  build() {
    Column() {
      Row() {
        Text(this.meetup.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)

        Text(this.meetup.status === 'upcoming' ? '即将开始' : (this.meetup.status === 'ongoing' ? '进行中' : '已结束'))
          .fontSize(12)
          .fontColor(this.meetup.status === 'ended' ? '#999' : '#007DFF')
          .backgroundColor(this.meetup.status === 'ended' ? '#f5f5f5' : '#E6F4FF')
          .borderRadius(4)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
      }
      .width('100%')

      Row() {
        Text('📍')
          .fontSize(14)
        Text(this.meetup.location)
          .fontSize(14)
          .fontColor('#666')
          .margin({ left: 4 })
      }
      .width('100%')
      .margin({ top: 8 })

      Row() {
        Text('📅')
          .fontSize(14)
        Text(`${this.meetup.date} ${this.meetup.time}`)
          .fontSize(14)
          .fontColor('#666')
          .margin({ left: 4 })
      }
      .width('100%')
      .margin({ top: 4 })

      Row() {
        Text(`👤 ${this.meetup.host}`)
          .fontSize(12)
          .fontColor('#999')

        Blank()

        Text(`${this.meetup.participants}/${this.meetup.maxParticipants} 人`)
          .fontSize(12)
          .fontColor(this.meetup.participants >= this.meetup.maxParticipants ? '#ff4444' : '#007DFF')
      }
      .width('100%')
      .margin({ top: 12 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#fff')
    .borderRadius(12)
    .shadow({ radius: 4, color: '#00000010', offsetX: 0, offsetY: 2 })
  }
}