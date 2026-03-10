/**
 * 首页 - CigarAtlas
 * 展示雪茄地图、推荐和发现功能
 */
import { JournalPage } from './JournalPage';
import { SocialPage } from './SocialPage';
import { MeetupPage } from './MeetupPage';
import { HumidorPage } from './HumidorPage';

@Entry
@Component
struct IndexPage {
  @State currentIndex: number = 0;

  private tabBuilder(title: string, targetIndex: number, normalIcon: Resource, selectedIcon: Resource) {
    Column() {
      Image(this.currentIndex === targetIndex ? selectedIcon : normalIcon)
        .width(24)
        .height(24)
      Text(title)
        .fontSize(10)
        .fontColor(this.currentIndex === targetIndex ? '#007DFF' : '#999999')
        .margin({ top: 4 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.currentIndex = targetIndex;
    })
  }

  build() {
    Tabs({ barPosition: BarPosition.End }) {
      TabContent() {
        HomeContent()
      }
      .tabBar(this.tabBuilder('首页', 0, $r('app.media.home_normal'), $r('app.media.home_selected')))

      TabContent() {
        JournalPage()
      }
      .tabBar(this.tabBuilder('品鉴', 1, $r('app.media.journal_normal'), $r('app.media.journal_selected')))

      TabContent() {
        SocialPage()
      }
      .tabBar(this.tabBuilder('圈子', 2, $r('app.media.social_normal'), $r('app.media.social_selected')))

      TabContent() {
        MeetupPage()
      }
      .tabBar(this.tabBuilder('聚会', 3, $r('app.media.meetup_normal'), $r('app.media.meetup_selected')))

      TabContent() {
        HumidorPage()
      }
      .tabBar(this.tabBuilder('雪茄柜', 4, $r('app.media.humidor_normal'), $r('app.media.humidor_selected')))
    }
    .barHeight(56)
    .onChange((index: number) => {
      this.currentIndex = index;
    })
  }
}

/**
 * 首页内容组件
 */
@Component
struct HomeContent {
  @State featuredCigars: CigarItem[] = [
    { id: '1', name: 'Cohiba Behike', origin: '古巴', rating: 4.8 },
    { id: '2', name: 'Montecristo No.2', origin: '古巴', rating: 4.7 },
    { id: '3', name: 'Arturo Fuente Opus X', origin: '多米尼加', rating: 4.9 }
  ];

  build() {
    Column() {
      // 顶部搜索栏
      Row() {
        Search({ placeholder: '搜索雪茄、品牌、店铺...' })
          .width('85%')
          .height(40)
          .backgroundColor('#f5f5f5')
          .borderRadius(20)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 精选推荐
      Column() {
        Text('精选推荐')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin({ top: 16, bottom: 12 })
          .width('100%')
          .padding({ left: 16 })

        List({ space: 12 }) {
          ForEach(this.featuredCigars, (item: CigarItem) => {
            ListItem() {
              CigarCard({ cigar: item })
            }
          }, (item: CigarItem) => item.id)
        }
        .width('100%')
        .padding({ left: 16, right: 16 })
        .layoutWeight(1)
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor('#fafafa')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#fafafa')
  }
}

/**
 * 雪茄卡片组件
 */
@Component
struct CigarCard {
  @Prop cigar: CigarItem = { id: '', name: '', origin: '', rating: 0 };

  build() {
    Row() {
      Column() {
        Text(this.cigar.name)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
        Text(this.cigar.origin)
          .fontSize(12)
          .fontColor('#666')
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      Row() {
        Text('⭐')
          .fontSize(14)
        Text(this.cigar.rating.toFixed(1))
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#fff')
    .borderRadius(12)
    .shadow({ radius: 4, color: '#00000010', offsetX: 0, offsetY: 2 })
  }
}

/**
 * 雪茄数据模型
 */
interface CigarItem {
  id: string;
  name: string;
  origin: string;
  rating: number;
}