import { Container, Graphics, Assets, type Spritesheet } from "pixi.js";

import { type IScene } from "./SceneManager";

export const manifest = {
  bundles: [
    {
      name: "initial-bundle",
      assets: {
        spritesheet: "assets/textures/texture.json",
      },
    },
  ],
};

export interface ILoaderSceneOptions {
  viewWidth: number;
  viewHeight: number;
}

export class LoaderScene extends Container implements IScene {
  private readonly barOptions = {
    width: 350,
    height: 50,
    fillColor: 0x008800,
    borderRadius: 5,
    borderThick: 5,
    borderColor: 0x000000,
  };

  private loaderBarFill!: Graphics;
  private loaderBarBorder!: Graphics;
  constructor(_: ILoaderSceneOptions) {
    super();

    this.setup();
    this.draw();
  }

  setup(): void {
    const loaderBarBorder = new Graphics();
    this.addChild(loaderBarBorder);
    this.loaderBarBorder = loaderBarBorder;

    const loaderBarFill = new Graphics();
    this.addChild(loaderBarFill);
    this.loaderBarFill = loaderBarFill;
  }

  draw(): void {
    const { loaderBarFill, loaderBarBorder, barOptions } = this;
    loaderBarBorder.beginFill(barOptions.borderColor);
    loaderBarBorder.drawRoundedRect(
      0,
      0,
      barOptions.width,
      barOptions.height,
      barOptions.borderRadius
    );
    loaderBarBorder.endFill();

    loaderBarFill.beginFill(barOptions.fillColor);
    loaderBarFill.drawRoundedRect(
      barOptions.borderThick,
      barOptions.borderThick,
      barOptions.width - barOptions.borderThick * 2,
      barOptions.height - barOptions.borderThick * 2,
      barOptions.borderRadius
    );
    loaderBarFill.endFill();
  }

  async initializeLoader(): Promise<void> {
    await Assets.init({ manifest });

    await Assets.loadBundle(
      manifest.bundles.map((bundle) => bundle.name),
      this.downloadProgress
    );
  }

  private readonly downloadProgress = (progressRatio: number): void => {
    this.loaderBarFill.width =
      (this.barOptions.width - this.barOptions.borderThick * 2) * progressRatio;
  };

  public getAssets(): {
    spritesheet: Spritesheet;
  } {
    return {
      spritesheet: Assets.get("spritesheet"),
    };
  }

  public handleResize({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    const availableWidth = viewWidth;
    const availableHeight = viewHeight;
    const totalWidth = this.width;
    const totalHeight = this.height;
    if (availableWidth >= totalWidth && availableHeight >= totalHeight) {
      const x =
        availableWidth > totalWidth ? (availableWidth - totalWidth) / 2 : 0;
      const y =
        availableHeight > totalHeight ? (availableHeight - totalHeight) / 2 : 0;

      this.x = x;
      this.width = this.barOptions.width;
      this.y = y;
      this.height = this.barOptions.height;
    } else {
      let scale = 1;
      if (totalHeight >= totalWidth) {
        scale = availableHeight / totalHeight;
        if (scale * totalWidth > availableWidth) {
          scale = availableWidth / totalWidth;
        }
      } else {
        scale = availableWidth / totalWidth;

        if (scale * totalHeight > availableHeight) {
          scale = availableHeight / totalHeight;
        }
      }
      const occupiedWidth = Math.floor(totalWidth * scale);
      const occupiedHeight = Math.floor(totalHeight * scale);
      const x =
        availableWidth > occupiedWidth
          ? (availableWidth - occupiedWidth) / 2
          : 0;
      const y =
        availableHeight > occupiedHeight
          ? (availableHeight - occupiedHeight) / 2
          : 0;

      this.x = x;
      this.width = occupiedWidth;
      this.y = y;
      this.height = occupiedHeight;
    }
  }

  handleMounted(): void { }

  public handleUpdate(): void { }
}