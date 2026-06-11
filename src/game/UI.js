export class UI {
    constructor(gameContainer, shop, onShopOpen) {
        this.gameContainer = gameContainer;
        this.shop = shop;
        this.onShopOpen = onShopOpen;
        this.shopGrid = null;
        this.walletEl = null;
        this.selectedItem = null;
        this.root = document.createElement('div');
        this.root.className = 'ui-overlay';
        this.hud = document.createElement('div');
        this.hud.className = 'hud';
        this.root.appendChild(this.hud);
        this.panel = document.createElement('div');
        this.panel.className = 'panel hidden';
        this.root.appendChild(this.panel);
        this.message = document.createElement('div');
        this.message.className = 'game-message';
        this.root.appendChild(this.message);
        this.bottomBar = document.createElement('div');
        this.bottomBar.className = 'bottom-bar';
        this.root.appendChild(this.bottomBar);
        gameContainer.appendChild(this.root);
        this.buildHud();
        this.buildBottomBar();
        this.renderShop();
    }
    buildHud() {
        const title = document.createElement('div');
        title.className = 'hud-panel';
        title.innerHTML = `<div class="hud-title">Dino Run</div>`;
        this.hud.appendChild(title);
        const stats = document.createElement('div');
        stats.className = 'hud-panel stat-group';
        stats.innerHTML = `
      <div><span class="stat-label">Distance</span><div id="hud-distance" class="stat-value">0m</div></div>
      <div><span class="stat-label">Best</span><div id="hud-best" class="stat-value">0m</div></div>
      <div><span class="stat-label">Wallet</span><div id="hud-wallet" class="stat-value">0</div></div>
    `;
        this.hud.appendChild(stats);
    }
    buildBottomBar() {
        const playButton = this.createNavButton('Play', 'nav-button nav-button nav-button--primary');
        const shopButton = this.createNavButton('Shop', 'nav-button');
        const settingsButton = this.createNavButton('Settings', 'nav-button');
        const missionsButton = this.createNavButton('Missions', 'nav-button');
        const homeButton = this.createNavButton('Home', 'nav-button');
        shopButton.addEventListener('click', () => this.onShopOpen());
        this.bottomBar.append(homeButton, missionsButton, playButton, shopButton, settingsButton);
    }
    createNavButton(text, classes) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = classes;
        return button;
    }
    updateHud(distance, best, coins) {
        const distanceEl = document.getElementById('hud-distance');
        const bestEl = document.getElementById('hud-best');
        const walletEl = document.getElementById('hud-wallet');
        if (distanceEl)
            distanceEl.textContent = `${distance}m`;
        if (bestEl)
            bestEl.textContent = `${best}m`;
        if (walletEl)
            walletEl.textContent = `${coins}`;
    }
    showMessage(title, subtitle) {
        this.message.innerHTML = `<h3 class="message-title">${title}</h3><p class="message-text">${subtitle}</p>`;
    }
    hideMessage() {
        this.message.innerHTML = '';
    }
    openShop() {
        this.panel.classList.remove('hidden');
    }
    closeShop() {
        this.panel.classList.add('hidden');
    }
    renderShop() {
        this.panel.innerHTML = `
      <div class="shop-header">
        <div>
          <h2>Shop</h2>
          <p class="shop-subtitle">Skins • Power-Ups • Coins</p>
        </div>
        <div class="shop-wallet" id="shop-wallet">${this.shop.balance} coins</div>
      </div>
      <div class="shop-grid" id="shop-grid"></div>
    `;
        this.shopGrid = this.panel.querySelector('#shop-grid');
        this.walletEl = this.panel.querySelector('#shop-wallet');
        this.updateShopGrid();
    }
    updateShopGrid() {
        if (!this.shopGrid)
            return;
        if (this.walletEl) {
            this.walletEl.textContent = `${this.shop.balance} coins`;
        }
        this.shopGrid.innerHTML = '';
        this.shop.skins.forEach((skin, index) => {
            const card = document.createElement('div');
            card.className = 'shop-card';
            card.innerHTML = `
        <h3>${skin.name}</h3>
        <div class="shop-price">${skin.price} coins</div>
        <div class="status-pill">${skin.unlocked ? 'Owned' : 'Locked'}</div>
      `;
            card.addEventListener('click', () => {
                if (skin.unlocked) {
                    this.shop.selectSkin(index);
                }
                else {
                    this.shop.buySkin(index);
                    this.updateShopGrid();
                }
            });
            if (this.shopGrid) {
                this.shopGrid.appendChild(card);
            }
        });
    }
}
//# sourceMappingURL=UI.js.map