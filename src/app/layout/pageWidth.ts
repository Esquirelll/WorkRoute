/**
 * The page's content width, used by the top bar, the page and the footer so they always line up.
 * 80rem (1280px) is wide enough for three columns on a laptop; on very large screens it grows a little
 * (88rem = 1408px) and then stops, because long lines are harder to read. Text blocks also keep their own
 * limit (about 68 characters per line), so wide screens never produce hard-to-read paragraphs.
 */
export const PAGE_WIDTH = 'mx-auto w-full max-w-7xl 2xl:max-w-[88rem]';
