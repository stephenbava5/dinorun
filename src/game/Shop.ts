import { Skin, ShopTab } from './types';

export class Shop {
  public tabs: ShopTab[] = ['skins', 'powerups', 'coins'];
  public selectedTab: ShopTab = 'skins';
  public selectedIndex = 0;
  public skins: Skin[] = [
    { id: 'default', name: 'Runner', price: 0, unlocked: true },
    { id: 'godzilla', name: 'Godzilla', price: 1500, unlocked: false },
    { id: 'kingkong', name: 'King Kong', price: 1500, unlocked: false },
    { id: 'homer', name: 'Homer', price: 1200, unlocked: false },
    { id: 'bart', name: 'Bart', price: 1200, unlocked: false },
    { id: 'spongebob', name: 'SpongeBob', price: 1200, unlocked: false },
    { id: 'trump', name: 'Donald Trump', price: 1500, unlocked: false },
    { id: 'bat_skateboard', name: 'Bat / Skateboard', price: 500, unlocked: false },
    { id: 'bugs_bunny', name: 'Bugs Bunny', price: 800, unlocked: false },
    { id: 'daffy_duck', name: 'Daffy Duck', price: 800, unlocked: false },
    { id: 'porky_pig', name: 'Porky Pig', price: 800, unlocked: false },
    { id: 'elmer_fudd', name: 'Elmer Fudd', price: 800, unlocked: false },
    { id: 'yosemite_sam', name: 'Yosemite Sam', price: 800, unlocked: false },
    { id: 'road_runner', name: 'Road Runner', price: 900, unlocked: false },
    { id: 'wile_coyote', name: 'Wile E. Coyote', price: 900, unlocked: false },
    { id: 'tweety', name: 'Tweety', price: 800, unlocked: false }
  ];

  public selectedSkin = 'default';
  public balance = 0;

  public buySkin(index: number) {
    const skin = this.skins[index];
    if (!skin || skin.unlocked || this.balance < skin.price) {
      return false;
    }
    skin.unlocked = true;
    this.balance -= skin.price;
    this.selectedSkin = skin.id;
    return true;
  }

  public selectSkin(index: number) {
    const skin = this.skins[index];
    if (!skin || !skin.unlocked) {
      return false;
    }
    this.selectedSkin = skin.id;
    return true;
  }
}
