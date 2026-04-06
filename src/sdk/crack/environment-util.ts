export class CrackEnvironmentUtil {
  isDesktop(): boolean {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  isMobile() : boolean {
    return !this.isDesktop();
  }
}
