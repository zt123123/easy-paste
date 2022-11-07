const { clipboard } = require('electron');

class ClipboardObserver {
  timer;
  beforeText;
  beforeImage;

  duration = 500;
  textChange;
  imageChange;

  constructor(options) {
    const { duration, textChange, imageChange } = options;

    this.duration = duration;
    this.textChange = textChange;
    this.imageChange = imageChange;

    if (this.textChange || this.imageChange) {
      this.start();
    }
  }

  /**
   * 设置定时器
   */
  setTimer() {
    this.timer = setInterval(() => {
      if (this.textChange) {
        const text = clipboard.readText();
        if (this.isDiffText(this.beforeText, text)) {
          this.textChange(text, this.beforeText);
          this.beforeText = text;
        }
      }

      if (this.imageChange) {
        const image = clipboard.readImage();
        if (this.isDiffImage(this.beforeImage, image)) {
          this.imageChange(image, this.beforeImage);
          this.beforeImage = image;
        }
      }
    }, this.duration);
  }

  /**
   * 清除定时器
   */
  clearTimer() {
    clearInterval(this.timer);
  }

  /**
   * 设置剪贴板默认内容
   */
  setClipboardDefaultValue() {
    if (this.textChange) {
      this.beforeText = clipboard.readText();
    }
    if (this.imageChange) {
      this.beforeImage = clipboard.readImage();
    }
  }

  /**
   * 判断内容是否不一致
   * @param beforeText
   * @param afterText
   * @returns
   */
  isDiffText(beforeText, afterText) {
    return afterText && beforeText !== afterText;
  }

  /**
   * 判断图片是否不一致
   * @param beforeImage
   * @param afterImage
   * @returns
   */
  isDiffImage(beforeImage, afterImage) {
    return afterImage && !afterImage.isEmpty() && beforeImage.toDataURL() !== afterImage.toDataURL();
  }

  /**
   * 开始
   */
  start() {
    this.setClipboardDefaultValue();
    this.setTimer();
  }

  /**
   * 暂停
   */
  stop() {
    this.clearTimer();
  }
}

module.exports = ClipboardObserver;
