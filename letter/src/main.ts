const arrow = document.querySelector('.page-quote .arrow') as HTMLImageElement;
const scrollSnap = document.querySelector('.scroll-snap') as HTMLDivElement;
const letterPage = document.querySelector('.page-letter ') as HTMLDivElement;

let scrollProhibitor: ReturnType<typeof setTimeout>;
let canScroll = false;
let arrowHidden = false;

scrollSnap.addEventListener('scroll', () => {
  if (scrollSnap.scrollTop === 0) {
    if (arrowHidden) {
      arrow.style.opacity = '1';
      letterPage.scrollTo({ top: 0 });
      arrowHidden = false;
    }
  } else if (!arrowHidden) {
    arrow.style.opacity = '0';
    arrowHidden = true;
  }

  if (scrollProhibitor) {
    clearTimeout(scrollProhibitor);
  }
  scrollProhibitor = setTimeout(() => {
    letterPage.style.pointerEvents = 'all';
    canScroll = true;
  }, 100);
  if (canScroll) {
    letterPage.style.pointerEvents = 'none';
    canScroll = false;
  }
});

export {};
