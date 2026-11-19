import y2026 from './solar-term-dates/2026.json';
import y2027 from './solar-term-dates/2027.json';
export const calendars = [y2026, y2027];
export const calendarYears = calendars.map(calendar => calendar.year);
export const calendarYearLabel = calendarYears.join('、');
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '') => `${base}/${path.replace(/^\//, '')}`;
export const storeURL = 'https://apps.apple.com/cn/app/id6447470002';
// Configure the provider token from App Store Connect before enabling campaign attribution.
export function downloadURL(campaign: string) {
 const target = new URL(storeURL);
 const provider = import.meta.env.PUBLIC_APP_STORE_PROVIDER_TOKEN;
 if (provider) { target.searchParams.set('pt', provider); target.searchParams.set('ct', campaign); target.searchParams.set('mt','8'); }
 return target.href;
}
export const seasons = [{id:'spring',name:'春',en:'SPRING',note:'万物生长，赴一场春的约定。',symbol:'❋'},{id:'summer',name:'夏',en:'SUMMER',note:'日光悠长，听风穿过绿荫。',symbol:'☀'},{id:'autumn',name:'秋',en:'AUTUMN',note:'露白风清，收集大地的回响。',symbol:'✳'},{id:'winter',name:'冬',en:'WINTER',note:'万物归藏，等待下一次新生。',symbol:'❄'}];
export const entries = Object.values(import.meta.glob('../content/solar-terms/*.md', {eager:true})) as any[];
export const terms = entries.sort((a,b)=>a.frontmatter.order-b.frontmatter.order);
export const dateFor = (slug:string,year=2026) => calendars.find(c=>c.year===year)!.terms.find(t=>t.slug===slug)!;
export const formatDate = (value:string) => value.replace(/^(\d+)-(\d+)-(\d+) /,'$1年$2月$3日 ');

export function seasonalMoment(now: Date = new Date()) {
  const events = calendars.flatMap(calendar => calendar.terms).sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
  const current = events.filter(term => Date.parse(term.datetime) <= now.getTime()).at(-1);
  const next = events.find(term => Date.parse(term.datetime) > now.getTime());
  return { current, next };
}
