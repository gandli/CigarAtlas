/**
 * HarmonyOS 应用入口
 * CigarAtlas - 雪茄地图应用
 */
import { IndexPage } from './pages/IndexPage';

@Entry
@Component
struct EntryAbility {
  onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.loadContent('pages/IndexPage', (err) => {
      if (err.code) {
        console.error('Failed to load content:', err);
        return;
      }
      console.info('Succeeded in loading content.');
    });
  }
}