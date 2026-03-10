/**
 * 社交圈子页面
 * 雪茄爱好者社区
 */
interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  time: string;
}

@Entry
@Component
struct SocialPage {
  @State posts: Post[] = [
    {
      id: '1',
      author: '雪茄老炮',
      avatar: '🧔',
      content: '今天入手了一盒 Cohiba Behike，迫不及待想和大家分享！这支雪茄的口感真是绝佳，浓郁而不刺激，回味悠长...',
      images: [],
      likes: 128,
      comments: 32,
      time: '2小时前'
    },
    {
      id: '2',
      author: '新手小明',
      avatar: '👨',
      content: '请问各位大佬，新手入门推荐什么品牌的雪茄？不要太贵的那种，先练练手~',
      images: [],
      likes: 45,
      comments: 56,
      time: '5小时前'
    },
    {
      id: '3',
      author: '雪茄鉴赏家',
      avatar: '🎩',
      content: '分享一下我最近的心得：好的雪茄需要时间沉淀，就像人生一样，慢慢品味才能体会其中的奥妙。',
      images: [],
      likes: 256,
      comments: 48,
      time: '昨天'
    }
  ];

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('圈子')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Button('+ 发帖')
          .fontSize(14)
          .height(32)
          .backgroundColor('#007DFF')
          .borderRadius(16)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 帖子列表
      List({ space: 1 }) {
        ForEach(this.posts, (post: Post) => {
          ListItem() {
            PostCard({ post: post })
          }
        }, (post: Post) => post.id)
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
 * 帖子卡片
 */
@Component
struct PostCard {
  @Prop post: Post = { id: '', author: '', avatar: '', content: '', images: [], likes: 0, comments: 0, time: '' };

  build() {
    Column() {
      // 作者信息
      Row() {
        Text(this.post.avatar)
          .fontSize(32)
        Column() {
          Text(this.post.author)
            .fontSize(15)
            .fontWeight(FontWeight.Medium)
          Text(this.post.time)
            .fontSize(12)
            .fontColor('#999')
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 12 })
        .layoutWeight(1)

        Text('...')
          .fontSize(18)
          .fontColor('#999')
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12 })

      // 内容
      Text(this.post.content)
        .fontSize(15)
        .lineHeight(22)
        .margin({ top: 12, left: 16, right: 16 })
        .width('100%')

      // 互动按钮
      Row() {
        Row() {
          Text('❤️')
            .fontSize(16)
          Text(`${this.post.likes}`)
            .fontSize(14)
            .fontColor('#666')
            .margin({ left: 4 })
        }
        .margin({ right: 24 })

        Row() {
          Text('💬')
            .fontSize(16)
          Text(`${this.post.comments}`)
            .fontSize(14)
            .fontColor('#666')
            .margin({ left: 4 })
        }

        Blank()

        Text('📤')
          .fontSize(16)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
    }
    .width('100%')
    .backgroundColor('#fff')
    .margin({ bottom: 8 })
  }
}