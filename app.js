const $ = id => document.getElementById(id);
const won = value => Math.round(value).toLocaleString('ko-KR') + '원';
function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function sourceLink(id, sources) {
  const source = sources.find(item => item.id === id);
  const url = source && safeUrl(source.url);
  if (!url) return document.createTextNode(' [출처 미확인]');
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.className = 'source'; link.textContent = '[' + id + '] 원문 ↗';
  return link;
}
function evidenceList(id, items, sources, label = item => item.claim) {
  const root = $(id); root.replaceChildren();
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty'; li.textContent = '확인 가능한 자료를 찾지 못했습니다.';
    root.append(li); return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.append(document.createTextNode(label(item)), sourceLink(item.sourceId, sources));
    root.append(li);
  });
}
function textList(id, items) {
  const root = $(id); root.replaceChildren();
  items.forEach(value => { const li = document.createElement('li'); li.textContent = value; root.append(li); });
}
function showReport(data, input) {
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const facts = data.facts || {};
  $('title').textContent = input.idea;
  $('subtitle').textContent = '타깃: ' + input.target + ' · 지역: ' + (input.region || '미지정');
  $('date').textContent = '조회 ' + new Date().toLocaleDateString('ko-KR');
  evidenceList('observation', facts.observation || [], sources);
  evidenceList('gis', facts.gis || [], sources);
  $('market').textContent = data.market?.definition || '비교 시장 정의가 필요합니다.';
  $('marketCaveat').textContent = data.market?.caveat || '';
  evidenceList('competitors', facts.competitors || [], sources, x => x.name + ' · ' + x.claim);
  $('competition').textContent = data.competitiveRead || '경쟁력 판단을 위한 자료가 부족합니다.';
  const prices = (facts.competitors || []).map(x => x.priceWon)
    .filter(x => typeof x === 'number' && Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  const base = prices.length ? prices[Math.floor(prices.length / 2)] : null;
  $('scenarios').replaceChildren();
  if (base) {
    $('priceBasis').textContent = '출처가 연결된 경쟁 제품 가격의 중앙값 ' + won(base) +
      '을 기준으로 계산했습니다. 동일한 용량과 판매 단위인지 원문 확인이 필요합니다.';
    const hasCost = Number.isFinite(input.cost);
    const unitCost = hasCost ? input.cost : Math.round(base * .45);
    [.9, 1, 1.1].forEach(rate => {
      const price = Math.round(base * rate / 100) * 100;
      const other = Math.round(price * .25);
      const tr = document.createElement('tr');
      [won(price), won(unitCost), won(other), won(price - unitCost - other)].forEach(value => {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      });
      $('scenarios').append(tr);
    });
    $('scenarioNote').textContent = '예시: 판매가 = 기준가의 90%·100%·110%, 제조원가 = ' +
      (hasCost ? '직접 입력한 금액' : '기준가의 45% 가정') +
      ', 유통·물류·판촉 등 = 판매가의 25% 가정. 남는 금액은 고정비·세금 차감 전이며 실제 이익이 아닙니다.';
  } else {
    $('priceBasis').textContent = '출처가 연결된 비교 가격이 없어 금액 시나리오를 계산하지 않았습니다.';
    $('scenarioNote').textContent = '같은 용량·판매 단위의 경쟁 가격을 확인한 뒤 다시 계산하세요.';
  }
  textList('validation', data.validation || []);
  textList('gaps', data.gaps || []);
  const list = $('sources'); list.replaceChildren();
  sources.forEach(source => {
    const url = safeUrl(source.url); if (!url) return;
    const li = document.createElement('li'), link = document.createElement('a');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = '[' + source.id + '] ' + (source.title || new URL(url).hostname);
    li.append(link);
    if (source.date) li.append(document.createTextNode(' · ' + source.date));
    list.append(li);
  });
  $('report').classList.add('visible');
  $('report').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('form').addEventListener('submit', async event => {
  event.preventDefault();
  const input = {
    idea: $('idea').value.trim(), target: $('target').value.trim(),
    region: $('region').value.trim(),
    cost: $('cost').value === '' ? null : Number($('cost').value)
  };
  $('error').hidden = true;
  if (!input.idea || !input.target) return;
  const configured = window.MARKET_API_URL;
  if (location.hostname.endsWith('github.io') && !configured) {
    $('error').textContent = '조사 서버 연결 전입니다. README의 Vercel 배포와 config.js 설정을 완료해 주세요.';
    $('error').hidden = false; return;
  }
  let accessCode = sessionStorage.getItem('marketAccessCode');
  if (!accessCode) {
    accessCode = window.prompt('조사 서버 접속 코드(사이트 운영자가 설정한 코드)를 입력하세요.');
    if (!accessCode) return;
    sessionStorage.setItem('marketAccessCode', accessCode);
  }
  $('submit').disabled = true;
  $('status').textContent = '공개 자료를 조사 중입니다. 잠시 기다려 주세요.';
  try {
    const response = await fetch(configured || '/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Access-Code': accessCode },
      body: JSON.stringify({ idea: input.idea, target: input.target, region: input.region })
    });
    const data = await response.json();
    if (response.status === 401) sessionStorage.removeItem('marketAccessCode');
    if (!response.ok) throw Error(data.error || '조사 요청 실패 (' + response.status + ')');
    showReport(data, input); $('status').textContent = '보고서를 만들었습니다.';
  } catch (error) {
    $('error').textContent = error.message || '조사 요청에 실패했습니다.';
    $('error').hidden = false; $('status').textContent = '';
  } finally { $('submit').disabled = false; }
});
$('print').addEventListener('click', () => window.print());
