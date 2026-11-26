// Small canvas chart helpers, written for this site. No libraries.
// Every chart is drawn on a <canvas> with a text table beside it, so the
// numbers are readable even where canvas is not.

const PALETTE = ['#0f766e', '#b45309', '#1d4ed8', '#be185d', '#15803d', '#7c3aed', '#a16207', '#0e7490'];
const GRID = '#e2e8f0';
const AXIS = '#64748b';

function setupCanvas(canvas, height) {
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

function niceMax(value) {
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / power;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return nice * power;
}

function formatTick(value) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, '');
  return String(value);
}

function drawAxes(ctx, plot, min, max, labels) {
  const steps = 4;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = AXIS;
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= steps; i++) {
    const value = min + ((max - min) * i) / steps;
    const y = plot.bottom - ((value - min) / (max - min)) * plot.height;
    ctx.beginPath();
    ctx.moveTo(plot.left, y);
    ctx.lineTo(plot.right, y);
    ctx.stroke();
    ctx.fillText(formatTick(value), plot.left - 8, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  labels.forEach((label, i) => {
    const x = plot.left + (i / Math.max(labels.length - 1, 1)) * plot.width;
    ctx.fillText(String(label), x, plot.bottom + 6);
  });
}

export function drawLineChart(canvas, labels, values, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas, options.height || 260);
  const color = options.color || PALETTE[0];
  const min = options.min !== undefined ? options.min : Math.min(0, ...values);
  const max = options.max !== undefined ? options.max : niceMax(Math.max(...values) * 1.05);
  const plot = { left: 48, right: width - 14, top: 14, bottom: height - 30 };
  plot.width = plot.right - plot.left;
  plot.height = plot.bottom - plot.top;
  const xAt = (i) => plot.left + (i / Math.max(values.length - 1, 1)) * plot.width;
  const yAt = (v) => plot.bottom - ((v - min) / (max - min)) * plot.height;
  drawAxes(ctx, plot, min, max, labels);
  ctx.beginPath();
  values.forEach((v, i) => (i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v))));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.lineTo(xAt(values.length - 1), plot.bottom);
  ctx.lineTo(xAt(0), plot.bottom);
  ctx.closePath();
  ctx.fillStyle = color + '22';
  ctx.fill();
  ctx.fillStyle = color;
  values.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(xAt(i), yAt(v), 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(formatTick(values[values.length - 1]), xAt(values.length - 1), yAt(values[values.length - 1]) - 8);
}

export function drawBarChart(canvas, labels, values, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas, options.height || 260);
  const color = options.color || PALETTE[0];
  const min = options.min !== undefined ? options.min : Math.min(0, ...values);
  const max = niceMax(Math.max(...values) * 1.08);
  const plot = { left: 48, right: width - 14, top: 14, bottom: height - 30 };
  plot.width = plot.right - plot.left;
  plot.height = plot.bottom - plot.top;
  drawAxes(ctx, plot, min, max, labels);
  const slot = plot.width / values.length;
  const barWidth = Math.min(46, slot * 0.62);
  ctx.fillStyle = color;
  values.forEach((v, i) => {
    const x = plot.left + slot * i + (slot - barWidth) / 2;
    const y = yOf(v);
    ctx.fillRect(x, y, barWidth, plot.bottom - y);
  });
  function yOf(v) {
    return plot.bottom - ((v - min) / (max - min)) * plot.height;
  }
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  values.forEach((v, i) => {
    const x = plot.left + slot * i + slot / 2;
    ctx.fillText(formatTick(v), x, yOf(v) - 4);
  });
}

export function drawDonutChart(canvas, items, options = {}) {
  const size = options.height || 260;
  const { ctx, width, height } = setupCanvas(canvas, size);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 24;
  const inner = radius * 0.58;
  let angle = -Math.PI / 2;
  const total = items.reduce((sum, item) => sum + item.share, 0);
  items.forEach((item, i) => {
    const sweep = (item.share / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    angle += sweep;
  });
  ctx.beginPath();
  ctx.arc(centerX, centerY, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.centerLabel || '', centerX, centerY - 8);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = AXIS;
  ctx.fillText(options.centerSub || '', centerX, centerY + 12);
}

export function drawTwoLines(canvas, labels, first, second, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas, options.height || 260);
  const min = options.min !== undefined ? options.min : Math.min(0, ...first.values, ...second.values);
  const max = niceMax(Math.max(...first.values, ...second.values) * 1.05);
  const plot = { left: 48, right: width - 14, top: 14, bottom: height - 30 };
  plot.width = plot.right - plot.left;
  plot.height = plot.bottom - plot.top;
  const xAt = (i) => plot.left + (i / Math.max(labels.length - 1, 1)) * plot.width;
  const yAt = (v) => plot.bottom - ((v - min) / (max - min)) * plot.height;
  drawAxes(ctx, plot, min, max, labels);
  [first, second].forEach((series) => {
    ctx.beginPath();
    series.values.forEach((v, i) => (i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v))));
    ctx.strokeStyle = series.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = series.color;
    series.values.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(v), 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  let legendX = plot.left;
  [first, second].forEach((series) => {
    ctx.fillStyle = series.color;
    ctx.fillRect(legendX, 4, 12, 12);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(series.label, legendX + 17, 10);
    legendX += 17 + ctx.measureText(series.label).width + 22;
  });
}

export function drawHorizontalBars(canvas, items, options = {}) {
  const rowHeight = 30;
  const height = Math.max(120, items.length * rowHeight + 46);
  const { ctx, width } = setupCanvas(canvas, height);
  const max = niceMax(Math.max(...items.map((item) => item.value)) * 1.1);
  const plot = { left: 150, right: width - 56, top: 10, bottom: height - 24 };
  plot.width = plot.right - plot.left;
  ctx.font = '12px system-ui, sans-serif';
  items.forEach((item, i) => {
    const y = plot.top + i * rowHeight;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, plot.left - 10, y + 11);
    const barWidth = (item.value / max) * plot.width;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fillRect(plot.left, y, barWidth, 20);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(item.valueText, plot.left + barWidth + 6, y + 11);
  });
}
