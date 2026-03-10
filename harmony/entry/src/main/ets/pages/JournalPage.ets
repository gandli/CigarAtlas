/**
 * 品鉴记录页面
 * 记录和管理雪茄品鉴体验
 */
interface JournalEntry {
  id: string;
  cigarName: string;
  date: string;
  rating: number;
  notes: string;
  flavors: string[];
}

@Entry
@Component
struct JournalPage {
  @State entries: JournalEntry[] = [
    {
      id: '1',
      cigarName: 'Cohiba Behike BHK52',
      date: '2024-01-15',
      rating: 4.5,
      notes: '浓郁醇厚，带有皮革和坚果香气',
      flavors: ['皮革', '坚果', '咖啡']
    },
    {
      id: '2',
      cigarName: 'Montecristo Edmundo',
      date: '2024-01-10',
      rating: 4.2,
      notes: '口感顺滑，木质香气明显',
      flavors: ['木质', '奶油', '香料']
    }
  ];

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('品鉴记录')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Button('添加')
          .fontSize(14)
          .height(32)
          .backgroundColor('#007DFF')
          .borderRadius(16)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 记录列表
      List({ space: 12 }) {
        ForEach(this.entries, (entry: JournalEntry) => {
          ListItem() {
            JournalCard({ entry: entry })
          }
        }, (entry: JournalEntry) => entry.id)
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
 * 品鉴记录卡片
 */
@Component
struct JournalCard {
  @Prop entry: JournalEntry = { id: '', cigarName: '', date: '', rating: 0, notes: '', flavors: [] };

  build() {
    Column() {
      Row() {
        Column() {
          Text(this.entry.cigarName)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
          Text(this.entry.date)
            .fontSize(12)
            .fontColor('#999')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        Row() {
          Text('⭐')
            .fontSize(14)
          Text(this.entry.rating.toFixed(1))
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
        }
      }
      .width('100%')

      Text(this.entry.notes)
        .fontSize(14)
        .fontColor('#666')
        .margin({ top: 12 })
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      // 风味标签
      Row() {
        ForEach(this.entry.flavors, (flavor: string) => {
          Text(flavor)
            .fontSize(12)
            .fontColor('#007DFF')
            .backgroundColor('#E6F4FF')
            .borderRadius(4)
            .padding({ left: 8, right: 8, top: 4, bottom: 4 })
            .margin({ right: 8 })
        }, (flavor: string) => flavor)
      }
      .margin({ top: 12 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#fff')
    .borderRadius(12)
    .shadow({ radius: 4, color: '#00000010', offsetX: 0, offsetY: 2 })
  }
}