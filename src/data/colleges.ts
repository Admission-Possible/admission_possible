// Every campus photo provided for the site, in /public/colleges. All of them
// ride in the motion sequences (hero windows and the campus carousel); none
// is left out because there are many. They are decorative, so each renders
// with empty alt text rather than a caption we cannot verify.
export const COLLEGE_IMAGES: { src: string; width: number; height: number }[] = [
  { src: '/colleges/01.jpg', width: 880, height: 586 },
  { src: '/colleges/02.jpg', width: 860, height: 484 },
  { src: '/colleges/03.jpg', width: 630, height: 420 },
  { src: '/colleges/04.jpg', width: 880, height: 659 },
  { src: '/colleges/05.jpg', width: 880, height: 586 },
  { src: '/colleges/06.jpg', width: 800, height: 600 },
  { src: '/colleges/07.jpg', width: 816, height: 460 },
  { src: '/colleges/08.jpg', width: 880, height: 868 },
  { src: '/colleges/09.jpg', width: 500, height: 333 },
  { src: '/colleges/10.jpg', width: 800, height: 533 },
  { src: '/colleges/11.jpg', width: 880, height: 587 },
  { src: '/colleges/12.jpg', width: 684, height: 418 },
  { src: '/colleges/13.jpg', width: 660, height: 880 },
  { src: '/colleges/14.jpg', width: 516, height: 387 },
  { src: '/colleges/15.jpg', width: 447, height: 447 },
  { src: '/colleges/16.jpg', width: 547, height: 365 },
  { src: '/colleges/17.jpg', width: 678, height: 452 },
  { src: '/colleges/18.jpg', width: 548, height: 364 },
  { src: '/colleges/19.jpg', width: 259, height: 194 },
  { src: '/colleges/20.jpg', width: 554, height: 554 },
  { src: '/colleges/21.jpg', width: 549, height: 364 },
  { src: '/colleges/22.jpg', width: 678, height: 452 },
  { src: '/colleges/23.jpg', width: 600, height: 400 },
  { src: '/colleges/24.jpg', width: 495, height: 880 },
  { src: '/colleges/25.jpg', width: 880, height: 493 },
  { src: '/colleges/26.jpg', width: 880, height: 440 },
  { src: '/colleges/27.jpg', width: 880, height: 586 },
  { src: '/colleges/28.jpg', width: 880, height: 660 },
  { src: '/colleges/29.jpg', width: 660, height: 880 },
  { src: '/colleges/30.jpg', width: 880, height: 587 },
  { src: '/colleges/31.jpg', width: 880, height: 586 },
  { src: '/colleges/32.jpg', width: 660, height: 880 },
];

/** Deal the photos round-robin across `count` windows: window i shows i, i+count, … */
export function windowImages(index: number, count: number): string[] {
  return COLLEGE_IMAGES.filter((_, i) => i % count === index).map((image) => image.src);
}
