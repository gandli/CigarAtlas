/**
 * 雪茄柜页面
 * 管理个人雪茄收藏
 */
interface CigarInventory {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  purchaseDate: string;
  storageLocation: string;
  condition: 'excellent' | 'good' | 'fair';
  notes: string;
}

@Entry
@Component
struct HumidorPage {
  @State inventories: CigarInventory[] = [
    {
      id: '1',
      name: 'Cohiba Behike BHK52',
      brand: 'Cohiba',
      quantity: 10,
      purchaseDate: '2024-01-05',
      storageLocation: '主雪茄柜',
      condition: 'excellent',
      notes: '存放温度18°C，湿度65%'
    },
    {
      id: '2',
      name: 'Montecristo No.2',
      brand: 'Montecristo',
      quantity: 25,
      purchaseDate: '2023-12-20',
      storageLocation: '主雪茄柜',
      condition: 'good',
      notes: ''
    },
    {
      id: '3',
      name: 'Arturo Fuente Opus X',
      brand: 'Arturo Fuente',
      quantity: 5,
      purchaseDate: '2024-01-10',
      storageLocation: '备用柜',
      condition: 'excellent',
      notes: '限量版，需要特别保存'
    }
  ];

  @State totalCigars: number = 40;

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('雪茄柜')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)

        Button('+ 添加')
          .fontSize(14)
          .height(32)
          .backgroundColor('#007DFF')
          .borderRadius(16)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fff')

      // 统计卡片
      Row() {
        Column() {
          Text('总数量')
            .fontSize(12)
            .fontColor('#999')
          Text(`${this.totalCigars}`)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#007DFF')
            .margin({ top: 4 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        Column() {
          Text('品类')
            .fontSize(12)
            .fontColor('#999')
          Text(`${this.inventories.length}`)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#007DFF')
            .margin({ top: 4 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        Column() {
          Text('存储位置')
            .fontSize(12)
            .fontColor('#999')
          Text('2')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#007DFF')
            .margin({ top: 4 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)
      }
      .width('100%')
      .padding({ top: 16, bottom: 16 })
      .backgroundColor('#fff')
      .borderRadius(12)
      .margin({ left: 16, right: 16, top: 12 })
      .shadow({ radius: 4, color: '#00000010', offsetX: 0, offsetY: 2 })

      // 收藏列表
      List({ space: 12 }) {
        ForEach(this.inventories, (item: CigarInventory) => {
          ListItem() {
            InventoryCard({ inventory: item })
          }
        }, (item: CigarInventory) => item.id)
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#fafafa')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#fafafa')
  }
}

/**
 * 库存卡片
 */
@Component
struct InventoryCard {
  @Prop inventory: CigarInventory = { id: '', name: '', brand: '', quantity: 0, purchaseDate: '', storageLocation: '', condition: 'good', notes: '' };

  private getConditionText(condition: string): string {
    switch (condition) {
      case 'excellent': return '极佳';
      case 'good': return '良好';
      case 'fair': return '一般';
      default: return '未知';
    }
  }

  private getConditionColor(condition: string): string {
    switch (condition) {
      case 'excellent': return '#52c41a';
      case 'good': return '#007DFF';
      case 'fair': return '#faad14';
      default: return '#999';
    }
  }

  build() {
    Column() {
      Row() {
        Text(this.inventory.name)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)

        Text(`${this.inventory.quantity} 支`)
          .fontSize(14)
          .fontColor('#007DFF')
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')

      Row() {
        Text(this.inventory.brand)
          .fontSize(12)
          .fontColor('#999')

        Blank()

        Text(this.getConditionText(this.inventory.condition))
          .fontSize(12)
          .fontColor(this.getConditionColor(this.inventory.condition))
      }
      .width('100%')
      .margin({ top: 8 })

      Row() {
        Text(`📍 ${this.inventory.storageLocation}`)
          .fontSize(12)
          .fontColor('#666')

        Blank()

        Text(`📅 ${this.inventory.purchaseDate}`)
          .fontSize(12)
          .fontColor('#666')
      }
      .width('100%')
      .margin({ top: 8 })

      if (this.inventory.notes) {
        Text(this.inventory.notes)
          .fontSize(12)
          .fontColor('#999')
          .margin({ top: 8 })
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#fff')
    .borderRadius(12)
    .shadow({ radius: 4, color: '#00000010', offsetX: 0, offsetY: 2 })
  }
}