/* Mini-game list — Client half.
 * A circular launcher at the bottom-right of the frame expands into a glass
 * menu; picking a game morphs that same frame into the game's own size and the
 * circle into a console bar (back / pause / per-game actions).
 *
 * Snake is the first playable game: arrows or WASD steer, the walls wrap, Space
 * pauses. The other shelf entries are still clickable placeholders.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-minigame-list',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useRef, useState } = React;

    const NS = 'minigame-list';

    const zh = {
      open: '打开小游戏',
      close: '关闭',
      settingsTitle: '主题',
      themeColor: '主题色',
      custom: '自定义',
      solid: '纯色',
      gradient: '渐变',
      advanced: '高级渐变',
      gradientHint: '左侧更深、右侧主题色；纯黑主题会反过来',
      gradientEnd: '渐变亮端',
      gradientStart: '起点',
      livePreview: '实时预览',
      solidHint: '关闭渐变，改用单色平涂',
      advancedHint: '两端各选一色，自定义双色渐变',
      texture: '纹理',
      textureColor: '纹理色',
      texNone: '无',
      texDots: '网点',
      texContour: '等高线',
      texGrid: '网格',
      resetTheme: '恢复默认',
      title: '小游戏',
      subtitle: '等回复的时候，玩点什么',
      waiting: '等待回复中…',
      tag: '占位',
      play: '可玩',
      back: '返回',
      pause: '暂停',
      resume: '继续',
      placeholder: '占位画面 · 未接入游戏逻辑',
      triggered: '已触发',
      resumeHint: '点控制台继续',
      paused: '已暂停',
      reasonManual: '手动暂停',
      reasonDone: '任务完成，自动暂停',
      reasonApproval: '等待授权，自动暂停',
      reasonPlan: '等待确认计划，自动暂停',
      reasonQuestion: '等待回答，自动暂停',
      reasonHidden: '面板已收起',
      stateIdle: '空闲',
      stateApproval: '等待授权',
      statePlan: '等待确认计划',
      stateQuestion: '等待回答',
      stateDone: '任务完成',
      setupHint: '选大小和密度开始，设置会被记住',
      gomoku: '五子棋',
      solo: '独弈',
      versus: '对弈',
      soloHint: '双人同屏',
      versusHint: '人机对战',
      gomokuHint: '选模式和难度开始，下次沿用',
      modeLabel: '模式',
      difficultyLabel: '难度',
      diffEasy: '简单',
      diffNormal: '普通',
      diffHard: '困难',
      diffEasyHint: '轻松上手',
      diffNormalHint: '标准难度',
      diffHardHint: '更具挑战',
      aiMissing: '对弈需要先安装 AI 引擎',
      aiInstall: '安装 AI 引擎',
      aiInstalled: 'AI 引擎已安装',
      aiNote: '引擎随插件提供，安装后离线可用',
      turnLabel: '轮到',
      black: '黑棋',
      white: '白棋',
      thinking: 'AI 思考中…',
      blackWins: '黑棋获胜',
      whiteWins: '白棋获胜',
      drawGame: '平局',
      reached2048: '达成 2048',
      keepGoing: '继续挑战',
      noMoves: '无路可走',
      tetrisKeys: '← → 移动 · ↓ 加速 · ↑ 旋转 · Enter 硬降',
      livesLabel: '命',
      breakoutServe: '点击或按 Enter 发球',
      linesLabel: '行',
      levelLabel: '等级',
      nextLabel: '下一个',
      xiangqi: '象棋',
      go: '围棋',
      red: '红方',
      blackSide: '黑方',
      wins: '获胜',
      pass: '停一手',
      captured: '提子',
      komi: '贴目',
      sizeLabel: '大小',
      densityLabel: '密度',
      small: '小',
      medium: '中',
      large: '大',
      huge: '特大',
      calm: '轻松',
      normal: '标准',
      dense: '密集',
      levelMines: '雷',
      safeFirst: '首击保护',
      start: '开始',
      newGame: '新局',
      win: '全部扫清',
      lose: '踩到雷了',
      time: '用时',
      settingsBack: '改设置',
      speed: '加速',
      boostOn: '加速中',
      undo: '撤销',
      rotate: '旋转',
      flag: '标记',
      hint: '提示',
      serve: '发球',
      score: '得分',
      best: '最佳',
      newRecord: '新纪录',
      startHint: '按方向键开始',
      keysHint: '方向键 / WASD 移动 · 空格暂停 · 撞墙从另一侧穿出',
      gameOver: '游戏结束',
      restart: '再来一局',
      restartHint: '按 Enter 重开',
      snake: '贪吃蛇',
      '2048': '2048',
      blocks: '俄罗斯方块',
      mines: '扫雷',
      match: '消消乐',
      breakout: '打砖块',
    };

    const en = {
      open: 'Open mini games',
      close: 'Close',
      settingsTitle: 'Theme',
      themeColor: 'Theme color',
      custom: 'Custom',
      solid: 'Solid',
      gradient: 'Gradient',
      advanced: 'Advanced',
      gradientHint: 'Darker left to theme on the right; flips for near-black themes',
      gradientEnd: 'Bright end',
      gradientStart: 'Start',
      livePreview: 'Live preview',
      solidHint: 'One flat colour, no gradient',
      advancedHint: 'Pick both ends for a custom two-colour blend',
      texture: 'Texture',
      textureColor: 'Texture color',
      texNone: 'None',
      texDots: 'Dots',
      texContour: 'Contours',
      texGrid: 'Grid',
      resetTheme: 'Reset',
      title: 'Mini games',
      subtitle: 'Something to play while you wait',
      waiting: 'Waiting for a reply…',
      tag: 'Placeholder',
      play: 'Playable',
      back: 'Back',
      pause: 'Pause',
      resume: 'Resume',
      placeholder: 'Placeholder screen — no game logic yet',
      triggered: 'Triggered',
      resumeHint: 'Resume from the console',
      paused: 'Paused',
      reasonManual: 'Paused by you',
      reasonDone: 'Turn finished — paused automatically',
      reasonApproval: 'Waiting for approval — paused automatically',
      reasonPlan: 'Waiting for plan review — paused automatically',
      reasonQuestion: 'Waiting for an answer — paused automatically',
      reasonHidden: 'Panel hidden',
      stateIdle: 'Idle',
      stateApproval: 'Waiting for approval',
      statePlan: 'Waiting for plan review',
      stateQuestion: 'Waiting for an answer',
      stateDone: 'Turn finished',
      setupHint: 'Pick a size and a density — your choice is remembered',
      gomoku: 'Gomoku',
      solo: 'Solo',
      versus: 'Versus',
      soloHint: 'Two players, one screen',
      versusHint: 'Play the AI',
      gomokuHint: 'Pick a mode and difficulty — remembered next time',
      modeLabel: 'Mode',
      difficultyLabel: 'Difficulty',
      diffEasy: 'Easy',
      diffNormal: 'Normal',
      diffHard: 'Hard',
      diffEasyHint: 'Relaxed',
      diffNormalHint: 'Standard',
      diffHardHint: 'Challenging',
      aiMissing: 'Versus needs the AI engine installed first',
      aiInstall: 'Install AI engine',
      aiInstalled: 'AI engine installed',
      aiNote: 'The engine ships with the plugin and works offline once installed',
      turnLabel: 'Turn',
      black: 'Black',
      white: 'White',
      thinking: 'AI is thinking…',
      blackWins: 'Black wins',
      whiteWins: 'White wins',
      drawGame: 'Draw',
      reached2048: 'You made 2048',
      keepGoing: 'Keep going',
      noMoves: 'No moves left',
      tetrisKeys: '← → move · ↓ soft drop · ↑ rotate · Enter hard drop',
      livesLabel: 'Lives',
      breakoutServe: 'Click or press Enter to serve',
      linesLabel: 'Lines',
      levelLabel: 'Level',
      nextLabel: 'Next',
      xiangqi: 'Xiangqi',
      go: 'Go',
      red: 'Red',
      blackSide: 'Black',
      wins: 'wins',
      pass: 'Pass',
      captured: 'captures',
      komi: 'komi',
      sizeLabel: 'Size',
      densityLabel: 'Density',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      huge: 'Huge',
      calm: 'Calm',
      normal: 'Normal',
      dense: 'Dense',
      levelMines: 'mines',
      safeFirst: 'Safe first click',
      start: 'Start',
      newGame: 'New game',
      win: 'Board cleared',
      lose: 'Boom',
      time: 'Time',
      settingsBack: 'Setup',
      speed: 'Speed',
      boostOn: 'Boosting',
      undo: 'Undo',
      rotate: 'Rotate',
      flag: 'Flag',
      hint: 'Hint',
      serve: 'Serve',
      score: 'Score',
      best: 'Best',
      newRecord: 'New best',
      startHint: 'Press an arrow key to start',
      keysHint: 'Arrows / WASD move · Space pauses · Walls wrap around',
      gameOver: 'Game over',
      restart: 'Play again',
      restartHint: 'Press Enter to restart',
      snake: 'Snake',
      '2048': '2048',
      blocks: 'Blocks',
      mines: 'Minesweeper',
      match: 'Match-3',
      breakout: 'Breakout',
    };

    const MENU = { w: 350, h: 460 };
    const SETTINGS_FRAME = { w: 380, h: 580 };
    const SNAKE_COLS = 20;
    const SNAKE_ROWS = 15;
    const BEST_KEY = 'dsh-minigame-list.snake.best';

    function readBest() {
      try {
        const value = Number(window.localStorage.getItem(BEST_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch (error) {
        return 0;
      }
    }

    function writeBest(value) {
      try {
        window.localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        /* storage unavailable: the record then lasts for this page only */
      }
    }

    const MINES_SETTINGS_KEY = 'dsh-minigame-list.mines.settings';
    /* Board size and mine density are chosen independently; each size also
     * carries the frame the panel should grow into. */
    const MINES_SIZES = [
      { id: 'small', cols: 9, rows: 9, w: 380, h: 360 },
      { id: 'medium', cols: 12, rows: 12, w: 420, h: 400 },
      { id: 'large', cols: 16, rows: 16, w: 480, h: 460 },
      { id: 'huge', cols: 20, rows: 20, w: 540, h: 520 },
    ];
    const MINES_DENSITIES = [
      { id: 'calm', pct: 0.1 },
      { id: 'normal', pct: 0.16 },
      { id: 'dense', pct: 0.22 },
    ];
    const MINES_OLD_LEVELS = { easy: 'small', medium: 'medium', hard: 'large' };

    function minesSize(id) {
      for (let i = 0; i < MINES_SIZES.length; i += 1) {
        if (MINES_SIZES[i].id === id) return MINES_SIZES[i];
      }
      return MINES_SIZES[1];
    }

    function minesDensity(id) {
      for (let i = 0; i < MINES_DENSITIES.length; i += 1) {
        if (MINES_DENSITIES[i].id === id) return MINES_DENSITIES[i];
      }
      return MINES_DENSITIES[1];
    }

    function minesCount(size, density) {
      return Math.max(1, Math.round(size.cols * size.rows * density.pct));
    }

    function minesFrame(size) {
      return { w: size.w, h: size.h };
    }

    function readMinesSettings() {
      try {
        const raw = window.localStorage.getItem(MINES_SETTINGS_KEY);
        if (!raw) return { size: 'medium', density: 'normal', safeFirst: true };
        const parsed = JSON.parse(raw);
        const size = MINES_SIZES.some((item) => item.id === parsed.size)
          ? parsed.size
          : (MINES_OLD_LEVELS[parsed.level] || 'medium');
        const density = MINES_DENSITIES.some((item) => item.id === parsed.density)
          ? parsed.density
          : 'normal';
        return { size, density, safeFirst: parsed.safeFirst !== false };
      } catch (error) {
        return { size: 'medium', density: 'normal', safeFirst: true };
      }
    }

    function writeMinesSettings(settings) {
      try {
        window.localStorage.setItem(MINES_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        /* storage unavailable: settings then last for this page only */
      }
    }

    function makeMinesBoard(level) {
      const cells = [];
      for (let i = 0; i < level.cols * level.rows; i += 1) {
        cells.push({ mine: false, open: false, flag: false, n: 0 });
      }
      return {
        cols: level.cols,
        rows: level.rows,
        mines: level.mines,
        cells,
        placed: false,
        opened: 0,
      };
    }

    function eachMinesNeighbor(cols, rows, index, visit) {
      const x = index % cols;
      const y = Math.floor(index / cols);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
          visit(ny * cols + nx);
        }
      }
    }

    /* Mines are seeded on the first reveal so the opening click can be made
     * safe (its cell and neighbours stay clear) whatever the board size. */
    function placeMines(board, safeIndex, safeFirst) {
      const cells = board.cells.map((cell) => ({ ...cell }));
      const total = board.cols * board.rows;
      const forbidden = new Set();
      if (safeFirst) {
        forbidden.add(safeIndex);
        eachMinesNeighbor(board.cols, board.rows, safeIndex, (index) => forbidden.add(index));
      }
      let placed = 0;
      while (placed < board.mines) {
        const index = Math.floor(Math.random() * total);
        if (cells[index].mine || forbidden.has(index)) continue;
        cells[index].mine = true;
        placed += 1;
      }
      for (let i = 0; i < total; i += 1) {
        if (cells[i].mine) continue;
        let count = 0;
        eachMinesNeighbor(board.cols, board.rows, i, (j) => {
          if (cells[j].mine) count += 1;
        });
        cells[i].n = count;
      }
      return { ...board, cells, placed: true };
    }

    function openMinesArea(board, index) {
      const cells = board.cells.map((cell) => ({ ...cell }));
      const stack = [index];
      let opened = 0;
      while (stack.length > 0) {
        const current = stack.pop();
        const cell = cells[current];
        if (cell.open || cell.flag || cell.mine) continue;
        cell.open = true;
        opened += 1;
        if (cell.n === 0) {
          eachMinesNeighbor(board.cols, board.rows, current, (j) => {
            if (!cells[j].open && !cells[j].flag) stack.push(j);
          });
        }
      }
      const total = board.cols * board.rows - board.mines;
      const totalOpened = board.opened + opened;
      return {
        board: { ...board, cells, opened: totalOpened },
        won: totalOpened === total,
      };
    }

    function minesClock(seconds) {
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;
      return minutes + ':' + (rest < 10 ? '0' + rest : String(rest));
    }

    const CSS = [
      '.mg-root{position:fixed;right:20px;bottom:20px;z-index:50;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:none;font-family:inherit}',
      /* Console circle / bar */
      '.mg-dock{pointer-events:auto;position:relative;box-sizing:border-box;overflow:hidden;width:50px;max-width:calc(100vw - 40px);height:50px;border-radius:25px;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary-foreground) 16%, transparent);background:linear-gradient(145deg,var(--dsw-alias-brand-primary),color-mix(in srgb,var(--dsw-alias-brand-primary) 82%,var(--dsw-alias-label-primary-foreground)));color:var(--dsw-alias-label-primary-foreground,#fff);box-shadow:0 12px 28px -10px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.22);transition:width .32s cubic-bezier(.16,1,.3,1),height .32s cubic-bezier(.16,1,.3,1),border-radius .32s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}',
      '.mg-dock[data-mode="game"]{height:44px;border-radius:14px}',
      '.mg-launch{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;color:inherit;cursor:pointer;transition:opacity .14s ease;-webkit-tap-highlight-color:transparent}',
      '.mg-dock[data-mode="game"] .mg-launch{opacity:0;pointer-events:none}',
      '.mg-launch:focus-visible{outline:2px solid currentColor;outline-offset:-4px;border-radius:inherit}',
      '.mg-glyph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:opacity .16s ease,transform .2s cubic-bezier(.2,.9,.3,1)}',
      '.mg-glyph[data-state="off"]{opacity:0;transform:rotate(-50deg) scale(.6)}',
      '.mg-glyph[data-state="on"]{opacity:1;transform:none}',
      '.mg-console{position:absolute;inset:0;display:flex;align-items:center;gap:2px;padding:0 5px;opacity:0;pointer-events:none;transform:translateY(3px);transition:opacity .16s ease,transform .2s ease}',
      '.mg-dock[data-mode="game"] .mg-console{opacity:1;pointer-events:auto;transform:none;transition-delay:.1s}',
      '.mg-cbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:9px;background:transparent;color:inherit;cursor:pointer;transition:background .14s ease;-webkit-tap-highlight-color:transparent}',
      '.mg-cbtn:hover{background:color-mix(in srgb, currentColor 14%, transparent)}',
      '.mg-cbtn:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
      '.mg-cbtn[aria-pressed="true"]{background:color-mix(in srgb, currentColor 20%, transparent)}',
      '.mg-cbtn svg{display:block}',
      '.mg-spacer{flex:1 1 auto;min-width:2px}',
      '.mg-caction{flex:none;height:26px;padding:0 9px;border:0;border-radius:8px;background:color-mix(in srgb, currentColor 12%, transparent);color:inherit;font-size:11px;font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;transition:background .14s ease}',
      '.mg-caction:hover{background:color-mix(in srgb, currentColor 20%, transparent)}',
      '.mg-caction[aria-pressed="true"]{background:color-mix(in srgb, currentColor 24%, transparent)}',
      '.mg-caction:focus-visible{outline:2px solid currentColor;outline-offset:1px}',
      '.mg-csep{flex:none;width:1px;height:16px;margin:0 3px;background:color-mix(in srgb, currentColor 20%, transparent)}',
      /* Frame */
      '.mg-panel{pointer-events:auto;box-sizing:border-box;position:relative;max-width:calc(100vw - 40px);max-height:min(78vh,620px);border-radius:20px;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);box-shadow:0 28px 70px -28px rgba(0,0,0,.6),0 8px 24px -12px rgba(0,0,0,.35);color:var(--dsw-alias-label-primary);overflow:hidden;opacity:0;transform:translateY(22px) scale(.9);transform-origin:bottom right;transition:opacity .26s cubic-bezier(.16,1,.3,1),transform .32s cubic-bezier(.16,1,.3,1),width .32s cubic-bezier(.16,1,.3,1),height .32s cubic-bezier(.16,1,.3,1)}',
      '.mg-panel[data-shown="true"]{opacity:1;transform:none}',
      '.mg-panel[data-open="false"]{display:none}',
      '.mg-view{position:absolute;inset:0;display:flex;flex-direction:column;box-sizing:border-box;overflow:auto;overscroll-behavior:contain;opacity:1;transform:none;transition:opacity .16s ease,transform .22s cubic-bezier(.16,1,.3,1)}',
      '.mg-view[data-active="false"]{opacity:0;transform:scale(.97);pointer-events:none}',
      '.mg-view[data-active="true"]{transition-delay:.1s}',
      '.mg-game{padding:12px;overflow:hidden;display:flex;flex-direction:column;gap:8px}',
      '.mg-gamebar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:20px;padding:0 2px;font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.mg-gamebar-state{display:inline-flex;align-items:center;gap:6px;min-width:0}',
      '.mg-gamebar-state span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.mg-state-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-secondary);opacity:.45}',
      '.mg-state-dot[data-tone="live"]{background:var(--dsw-alias-state-success-primary);opacity:1;animation:mg-pulse 1.4s ease-out infinite}',
      '.mg-state-dot[data-tone="warn"]{background:var(--dsw-alias-state-warn-primary);opacity:1}',
      '.mg-state-dot[data-tone="done"]{background:var(--dsw-alias-state-success-primary);opacity:1}',
      '.mg-gamebar-pill{flex:none;padding:1px 7px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);font-size:10px;line-height:1.6;color:var(--dsw-alias-label-secondary)}',
      '.mg-gamebar-pill[data-auto="true"]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 20%, transparent);color:var(--dsw-alias-label-primary)}',
      /* Menu — arcade selector: masthead rule, keycap tiles, status bar */
      '.mg-menu{overflow:hidden;background:#ffffff;color:#0f1115}',
      '.mg-menu-inner{position:relative;z-index:1;display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;padding:16px 16px 14px}',
      '.mg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:0}',
      '.mg-head-main{flex:1 1 auto;min-width:0}',
      '.mg-kicker-row{display:flex;align-items:center;gap:9px}',
      '.mg-kicker{flex:none;font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.3em;color:#8b929c}',
      '.mg-kicker-rule{flex:1 1 auto;height:1px;background:#eceef1;transform:scaleX(0);transform-origin:left}',
      '.mg-panel[data-shown="true"] .mg-kicker-rule{transform:scaleX(1);animation:mg-rule-in .52s cubic-bezier(.16,1,.3,1) 60ms backwards}',
      '@keyframes mg-rule-in{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
      '.mg-title{display:flex;align-items:center;gap:9px;margin:7px 0 0;font-size:30px;line-height:1.05;letter-spacing:-.01em;font-weight:800;color:#0f1115}',
      '.mg-title::after{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--mg-accent,#0f1115);box-shadow:0 0 0 1px rgba(15,17,21,.12)}',
      '.mg-sub{margin:7px 0 0;font:500 10.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em;color:#8b929c}',
      '.mg-wait{display:inline-flex;align-items:center;gap:7px;margin-top:2px;padding:3px 10px 3px 6px;border-radius:999px;background:#e9f6ee;color:#33403a;font-family:system-ui,"Microsoft YaHei",sans-serif;font-size:11px;letter-spacing:.02em}',
      '.mg-dot{position:relative;flex:none;width:15px;height:15px;border-radius:5px;background:#c9edd6;animation:mg-pulse 1.6s ease-out infinite}',
      '.mg-dot::after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#16a34a}',
      '@keyframes mg-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,#16a34a 45%, transparent)}70%{box-shadow:0 0 0 5px transparent}100%{box-shadow:0 0 0 0 transparent}}',
      '.mg-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid #dcdfe4;border-radius:12px;background:#ffffff;color:#0f1115;cursor:pointer;transition:background .12s ease,border-color .12s ease,color .12s ease}',
      '.mg-close:hover{background:var(--mg-accent,#0f1115);border-color:var(--mg-accent,#0f1115);color:var(--mg-on-accent,#ffffff)}',
      '.mg-close:focus-visible{outline:2px solid var(--mg-accent,#0f1115);outline-offset:2px}',
      '.mg-grid{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:8px}',
      '.mg-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;min-width:0;padding:10px;border-radius:10px;border:1px solid #e6e8ec;background:#ffffff;color:#111827;cursor:pointer;text-align:left;opacity:0;transition:border-color .14s ease,background .14s ease,color .14s ease,box-shadow .16s ease,transform .16s cubic-bezier(.16,1,.3,1),opacity .18s ease;-webkit-tap-highlight-color:transparent}',
      '.mg-panel[data-shown="true"] .mg-card{opacity:1;animation:mg-card-in .34s cubic-bezier(.16,1,.3,1) var(--mg-delay,0ms) backwards}',
      '@keyframes mg-card-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '.mg-card:hover{border-color:var(--mg-accent,#0f1115);background:color-mix(in srgb,var(--mg-accent,#0f1115) 5%,#ffffff);transform:translateY(-1px);box-shadow:0 12px 22px -18px rgba(15,17,21,.4)}',
      '.mg-card:active{transform:translateY(0) scale(.985);box-shadow:none}',
      '.mg-card:focus-visible{outline:2px solid var(--mg-accent,#0f1115);outline-offset:2px}',
      '.mg-index{font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.12em;color:#a0a7b1;transition:color .14s ease}',
      '.mg-card:hover .mg-index,.mg-card:focus-visible .mg-index{color:var(--mg-accent,#0f1115)}',
      '.mg-icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:#f4f5f7;color:#4b5563;transition:background .14s ease,color .14s ease}',
      '.mg-icon svg{display:block;width:22px;height:22px}',
      '.mg-card-main{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;width:100%;margin:auto 0;min-width:0}',
      '.mg-card:hover .mg-icon,.mg-card:focus-visible .mg-icon{background:color-mix(in srgb,var(--mg-accent,#0f1115) 12%,#ffffff);color:var(--mg-accent,#0f1115)}',
      '.mg-name{font-size:12px;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
      '.mg-foot{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:9px;border-top:1px solid #eceef1;font:500 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.12em;color:#a0a7b1}',
      /* Theme settings — a calibration sheet: live console preview, numbered sections */
      '.mg-settings{overflow:auto;background:#ffffff;color:#0f1115;scrollbar-width:thin;scrollbar-color:#d8dbe1 transparent;scrollbar-gutter:stable}',
      '.mg-settings::-webkit-scrollbar{width:8px;height:8px}',
      '.mg-settings::-webkit-scrollbar-thumb{background:#dde0e6;border:2px solid #ffffff;border-radius:999px}',
      '.mg-set-inner{position:relative;z-index:1;display:flex;flex-direction:column;gap:16px;width:100%;min-height:100%;box-sizing:border-box;padding:16px 20px 18px}',
      '.mg-set-head{display:flex;align-items:center;gap:10px}',
      '.mg-set-back{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:1px solid #dcdfe4;border-radius:10px;background:#ffffff;color:#0f1115;cursor:pointer;transition:background .14s ease,border-color .14s ease,color .14s ease}',
      '.mg-set-back:hover{background:#0f1115;border-color:#0f1115;color:#ffffff}',
      '.mg-set-back:focus-visible{outline:2px solid #0f1115;outline-offset:2px}',
      '.mg-set-title{margin:0;flex:1;font-size:19px;font-weight:750;letter-spacing:-.01em}',
      '.mg-set-kicker{font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.28em;color:#8b929c}',
      /* Live preview: the dock surface the settings below actually paint */
      '.mg-prev{display:flex;flex-direction:column;gap:7px}',
      '.mg-prev-plate{position:relative;display:flex;align-items:center;height:58px;padding:0 9px;border-radius:14px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(15,17,21,.08),0 14px 30px -20px rgba(15,17,21,.55)}',
      '.mg-prev-hud{position:relative;display:flex;align-items:center;gap:4px;width:100%}',
      '.mg-prev-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:color-mix(in srgb,currentColor 16%,transparent)}',
      '.mg-prev-cap{display:flex;align-items:center;justify-content:space-between;gap:8px;font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;color:#8b929c}',
      '.mg-live{display:inline-flex;align-items:center;gap:6px}',
      '.mg-live::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--mg-accent,#0f1115);box-shadow:0 0 0 3px color-mix(in srgb,var(--mg-accent,#0f1115) 14%,transparent)}',
      '.mg-prev-hex{color:#5b6470;font-variant-numeric:tabular-nums}',
      /* Sections */
      '.mg-set-body{flex:1 1 auto;display:flex;flex-direction:column;gap:16px}',
      '.mg-set-sec{display:flex;flex-direction:column;gap:9px}',
      '.mg-set-sec-head{display:flex;align-items:center;gap:8px}',
      '.mg-set-num{font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;color:#a0a7b1}',
      '.mg-set-dot{width:5px;height:5px;border-radius:50%;background:var(--mg-accent,#0f1115);box-shadow:0 0 0 1px rgba(15,17,21,.16)}',
      '.mg-set-label{margin:0;font:600 9.5px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;color:#5b6470}',
      '.mg-set-rule{flex:1 1 auto;height:1px;background:#eceef1}',
      '.mg-set-val{font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.1em;color:#a0a7b1;font-variant-numeric:tabular-nums}',
      /* Colour swatches */
      '.mg-swatches{display:flex;align-items:center;gap:8px}',
      '.mg-swatch{position:relative;flex:none;width:30px;height:30px;padding:0;border:1px solid rgba(15,17,21,.14);border-radius:50%;cursor:pointer;transition:transform .14s ease,box-shadow .14s ease}',
      '.mg-swatch:hover{transform:translateY(-1px)}',
      '.mg-swatch:focus-visible{outline:2px solid #0f1115;outline-offset:3px}',
      '.mg-swatch-on{box-shadow:0 0 0 2px #ffffff,0 0 0 3.5px #0f1115}',
      '.mg-swatch-tick{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}',
      /* Label + control rows */
      '.mg-set-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:32px}',
      '.mg-set-row-main{display:flex;flex-direction:column;gap:3px;min-width:0}',
      '.mg-set-row-label{font-size:12.5px;line-height:1.2;font-weight:600;color:#0f1115}',
      '.mg-set-row-hint{font:500 9.5px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em;color:#8b929c}',
      '.mg-toggle{position:relative;flex:none;width:40px;height:24px;padding:0;border:0;border-radius:999px;background:#e6e8ec;cursor:pointer;transition:background .16s ease}',
      '.mg-toggle::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#ffffff;box-shadow:0 1px 3px rgba(15,17,21,.24);transition:transform .18s cubic-bezier(.16,1,.3,1)}',
      '.mg-toggle[aria-checked="true"]{background:#0f1115}',
      '.mg-toggle[aria-checked="true"]::after{transform:translateX(16px)}',
      '.mg-toggle:focus-visible{outline:2px solid #0f1115;outline-offset:3px}',
      /* Colour well */
      '.mg-well{display:inline-flex;align-items:center;gap:7px;padding:3px 10px 3px 4px;border:1px solid #dcdfe4;border-radius:999px;background:#ffffff;cursor:pointer;transition:border-color .14s ease,box-shadow .14s ease}',
      '.mg-well:hover{border-color:#b9bec7}',
      '.mg-well:focus-within{border-color:#0f1115;box-shadow:0 0 0 3px rgba(15,17,21,.07)}',
      '.mg-well input[type=color]{-webkit-appearance:none;appearance:none;flex:none;width:22px;height:22px;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',
      '.mg-well input[type=color]::-webkit-color-swatch-wrapper{padding:0}',
      '.mg-well input[type=color]::-webkit-color-swatch{border:1px solid rgba(15,17,21,.16);border-radius:50%}',
      '.mg-well input[type=color]::-moz-color-swatch{border:1px solid rgba(15,17,21,.16);border-radius:50%}',
      '.mg-well-text{font:600 9.5px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;color:#4b5563;font-variant-numeric:tabular-nums}',
      /* Gradient presets */
      '.mg-grads{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.mg-set-colors{display:flex;align-items:center;gap:8px}',
      '.mg-grad{position:relative;height:40px;padding:0;border:1px solid rgba(15,17,21,.1);border-radius:10px;cursor:pointer;overflow:hidden;transition:box-shadow .14s ease,transform .14s ease}',
      '.mg-grad:hover{transform:translateY(-1px)}',
      '.mg-grad:focus-visible{outline:2px solid #0f1115;outline-offset:2px}',
      '.mg-grad-on{box-shadow:0 0 0 2px #ffffff,0 0 0 3.5px #0f1115}',
      '.mg-auto{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:#f7f8fa;font:500 10px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6b7480}',
      '.mg-auto-chip{flex:none;width:26px;height:16px;border-radius:5px;border:1px solid rgba(15,17,21,.1)}',
      /* Texture tiles */
      '.mg-texs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}',
      '.mg-tex{display:flex;flex-direction:column;gap:5px;padding:0;border:0;background:transparent;cursor:pointer;font:inherit;color:inherit}',
      '.mg-tex-tile{position:relative;height:38px;border-radius:9px;overflow:hidden;border:1px solid rgba(15,17,21,.1);transition:box-shadow .14s ease}',
      '.mg-tex:hover .mg-tex-tile{box-shadow:0 0 0 1px rgba(15,17,21,.2)}',
      '.mg-tex:focus-visible{outline:none}',
      '.mg-tex:focus-visible .mg-tex-tile{box-shadow:0 0 0 2px #ffffff,0 0 0 3.5px #0f1115}',
      '.mg-tex[aria-pressed="true"] .mg-tex-tile{box-shadow:0 0 0 2px #ffffff,0 0 0 3.5px #0f1115}',
      '.mg-tex-name{font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em;color:#8b929c;text-align:center}',
      '.mg-tex[aria-pressed="true"] .mg-tex-name{color:#0f1115}',
      '.mg-tex .mg-tx-wrap{-webkit-mask-image:none;mask-image:none}',
      /* Reset */
      '.mg-set-reset{display:flex;align-items:center;justify-content:center;gap:7px;height:44px;margin-top:auto;padding:0;border:0;border-top:1px solid #eceef1;border-radius:0;background:transparent;font-size:12px;font-weight:600;color:#5b6470;cursor:pointer;transition:background .14s ease,color .14s ease}',
      '.mg-set-reset:hover{background:#f7f8fa;color:#0f1115}',
      '.mg-set-reset:focus-visible{outline:2px solid #0f1115;outline-offset:-4px}',
      /* Dock texture */
      '.mg-tx-wrap{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;-webkit-mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.18) 24%,#000 62%);mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.18) 24%,#000 62%)}',
      '.mg-dock[data-mode="menu"] .mg-tx-wrap{display:none}',
      '.mg-tx{position:absolute;inset:-60%;opacity:.32;background-repeat:repeat}',
      '.mg-tex-host[data-texture="none"] .mg-tx{display:none}',
      '.mg-tex-host[data-texture="dots"] .mg-tx{background-image:radial-gradient(circle,var(--mg-tex,#ffffff) .9px,transparent 1.1px);background-size:6px 6px;transform:rotate(-18deg) scale(1.8);animation:mg-drift-x 6s linear infinite}',
      '@keyframes mg-drift-x{from{background-position:0 0}to{background-position:-6px 0}}',
      '.mg-tex-host[data-texture="grid"] .mg-tx{background-image:linear-gradient(var(--mg-tex,#ffffff) .75px,transparent .75px),linear-gradient(90deg,var(--mg-tex,#ffffff) .75px,transparent .75px);background-size:6px 6px;transform:rotate(-12deg) scale(1.6);animation:mg-drift-x 8s linear infinite}',
      '.mg-tex-host[data-texture="contour"] .mg-tx{background:var(--mg-tex,#ffffff);transform:rotate(-10deg) scale(1.7);-webkit-mask-image:var(--mg-contour);mask-image:var(--mg-contour);-webkit-mask-size:260px 131px;mask-size:260px 131px;-webkit-mask-repeat:repeat;mask-repeat:repeat;animation:mg-mask-drift 26s linear infinite}',
      '@keyframes mg-mask-drift{from{-webkit-mask-position:0 0;mask-position:0 0}to{-webkit-mask-position:-260px 0;mask-position:-260px 0}}',
      /* Stage */
      '.mg-stage{position:relative;flex:1 1 auto;min-height:0;width:100%;border-radius:14px;overflow:hidden;background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent)}',
      '.mg-stage-grid{position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent) 1px,transparent 1px);background-size:24px 24px}',
      '.mg-stage-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}',
      '.mg-stage-icon{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);color:var(--dsw-alias-label-primary)}',
      '.mg-stage-title{margin-top:4px;font-size:14px;font-weight:600}',
      '.mg-stage-hint{font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.mg-pause{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}',
      '.mg-pause-icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);color:var(--dsw-alias-label-primary);margin-bottom:4px}',
      '.mg-pause-title{font-size:13px;font-weight:600}',
      '.mg-pause-reason{font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.mg-pause-hint{margin-top:6px;font-size:11px;color:var(--dsw-alias-label-secondary);opacity:.8}',
      '.mg-note{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:5;padding:4px 10px;border-radius:8px;font-size:11px;line-height:1.4;white-space:nowrap;background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-toast-label);box-shadow:0 6px 18px rgba(0,0,0,.24)}',
      /* Snake */
      '.mg-snake{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:14px;outline:none;-webkit-tap-highlight-color:transparent}',
      '.mg-snake-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:24px;pointer-events:none}',
      '.mg-hud-score{display:flex;align-items:baseline;gap:6px}',
      '.mg-hud-label{font-size:10px;line-height:1;letter-spacing:.08em;color:var(--dsw-alias-label-secondary)}',
      '.mg-hud-value{font-size:17px;font-weight:700;line-height:1;letter-spacing:-.02em;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.mg-hud-right{display:flex;align-items:center;gap:6px}',
      '.mg-hud-best{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;font-variant-numeric:tabular-nums}',
      '.mg-hud-best svg{display:block;opacity:.85}',
      '.mg-hud-boost{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 22%, transparent);color:var(--dsw-alias-label-primary);font-size:10px;font-weight:600;line-height:1}',
      '.mg-snake-board{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:repeat(20,minmax(0,1fr));grid-template-rows:repeat(15,minmax(0,1fr));gap:1px;padding:6px;box-sizing:border-box;border-radius:12px;background:#ffffff;border:0;box-shadow:none}',
      '.mg-cell{position:relative;border-radius:4px;background:transparent;transition:background-color .08s linear}',
      '.mg-cell::after{content:"";position:absolute;left:50%;top:50%;width:2px;height:2px;margin:-1px 0 0 -1px;border-radius:50%;background:rgba(15,23,42,.16);pointer-events:none}',
      '.mg-cell-body::after,.mg-cell-head::after,.mg-cell-food::after{display:none}',
      '.mg-cell-body{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 78%, transparent)}',
      '.mg-cell-head{background:var(--dsw-alias-state-success-primary)}',
      '.mg-cell-food{background:var(--dsw-alias-state-error-primary);border-radius:50%;transform:scale(.74)}',
      '.mg-snake-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:12px;text-align:center;background:color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}',
      '.mg-snake-tip{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.mg-snake-tip-sub{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}',
      '.mg-snake-over-title{font-size:14px;font-weight:600}',
      '.mg-snake-over-score{display:flex;align-items:baseline;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.mg-snake-over-score b{font-size:20px;line-height:1;color:var(--dsw-alias-label-primary)}',
      '.mg-snake-over-best{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.mg-snake-record{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;line-height:1.6;background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 22%, transparent);color:var(--dsw-alias-label-primary)}',
      '.mg-snake-restart{height:28px;margin-top:4px;padding:0 14px;border:0;border-radius:9px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,#fff);font-size:12px;font-weight:600;cursor:pointer}',
      '.mg-snake-restart:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      /* Minesweeper */
      '.mg-mines{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px;border-radius:14px}',
      '.mg-mines-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:18px;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none}',
      '.mg-mines-hud-left{display:inline-flex;align-items:center;gap:5px}',
      '.mg-mines-hud b{font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.mg-mines-clock{font-variant-numeric:tabular-nums}',
      '.mg-mines-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:2px}',
      '.mg-mines-board{height:100%;max-height:100%;aspect-ratio:1;max-width:100%;display:grid;grid-template-columns:repeat(var(--mg-cols,9),minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:2px;padding:2px;box-sizing:border-box}',
      '.mg-mcell{display:flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:4px;font:inherit;font-size:13px;font-weight:700;line-height:1;cursor:pointer;background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);color:var(--dsw-alias-label-primary);transition:background-color .1s ease}',
      '.mg-mcell:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)}',
      '.mg-mcell:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.mg-mcell-open{background:color-mix(in srgb, var(--dsw-alias-label-primary) 2.5%, transparent);cursor:default}',
      '.mg-mcell-open:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 2.5%, transparent)}',
      '.mg-mcell svg{display:block}',
      '.mg-mflag{display:block;width:9px;height:9px;border-radius:50%;background:#dc2626;box-shadow:0 0 0 2px color-mix(in srgb,#dc2626 20%,transparent)}',
      '.mg-mnum-1{color:#3b82f6}.mg-mnum-2{color:#16a34a}.mg-mnum-3{color:#dc2626}.mg-mnum-4{color:#7c3aed}.mg-mnum-5{color:#b45309}.mg-mnum-6{color:#0891b2}.mg-mnum-7{color:#db2777}.mg-mnum-8{color:#4b5563}',
      '.mg-mines-over{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}',
      '.mg-mines-over-title{font-size:14px;font-weight:600}',
      '.mg-mines-over-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.mg-mines-over-actions{display:flex;align-items:center;gap:8px;margin-top:4px}',
      '.mg-mines-btn{height:28px;padding:0 14px;border:0;border-radius:9px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,#fff);font-size:12px;font-weight:600;cursor:pointer}',
      '.mg-mines-btn-ghost{background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);color:var(--dsw-alias-label-primary)}',
      '.mg-mines-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.mg-mines-setup{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:12px;overflow:auto}',
      '.mg-mines-setup-head h3{margin:0;font-size:14px;font-weight:600}',
      '.mg-mines-setup-head p{margin:3px 0 0;font-size:11.5px;line-height:1.45;color:var(--dsw-alias-label-secondary)}',
      '.mg-mines-group{display:flex;flex-direction:column;gap:6px;margin-top:2px}',
      '.mg-mines-group-label{font-size:10px;letter-spacing:.06em;color:var(--dsw-alias-label-secondary)}',
      '.mg-mines-chips{display:flex;gap:6px}',
      '.mg-chip{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:6px 8px;border-radius:9px;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent);background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);font:inherit;color:inherit;text-align:left;cursor:pointer;transition:background-color .14s ease,border-color .14s ease}',
      '.mg-chip:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)}',
      '.mg-chip[aria-pressed="true"]{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent)}',
      '.mg-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.mg-chip b{font-size:12px;font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
      '.mg-chip span{font-size:10px;line-height:1.25;color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.mg-mines-switch{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 2px;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}',
      '.mg-switch{position:relative;flex:none;width:30px;height:18px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);transition:background-color .16s ease}',
      '.mg-switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-bg-base);transition:transform .16s ease,background-color .16s ease}',
      '.mg-mines-switch[aria-checked="true"] .mg-switch{background:var(--dsw-alias-brand-primary)}',
      '.mg-mines-switch[aria-checked="true"] .mg-switch::after{transform:translateX(12px);background:var(--dsw-alias-label-primary-foreground,#fff)}',
      '.mg-mines-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.mg-mines-start{margin-top:auto;height:32px;border:0;border-radius:10px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,#fff);font-size:12.5px;font-weight:600;cursor:pointer}',
      '.mg-mines-start:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.mg-mines-start[disabled]{opacity:.45;cursor:default}',
      /* Gomoku */
      '.mg-gomoku{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-gomoku-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:18px;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none}',
      '.mg-gomoku-turn{display:inline-flex;align-items:center;gap:5px}',
      '.mg-turn-dot{width:9px;height:9px;border-radius:50%;box-shadow:0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 35%, transparent)}',
      '.mg-turn-dot[data-color="1"]{background:#1b1b1d}',
      '.mg-turn-dot[data-color="2"]{background:#f7f7f8}',
      '.mg-gomoku-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.mg-gomoku-board{position:relative;width:100%;aspect-ratio:1;height:auto;max-height:100%;box-sizing:border-box;padding:3%;border-radius:10px;background:linear-gradient(145deg,#e7cba3,#d6b083);box-shadow:inset 0 0 0 1px rgba(107,78,46,.35),0 1px 2px rgba(0,0,0,.18);cursor:pointer;touch-action:manipulation}',
      '.mg-gomoku-grid{position:relative;width:100%;height:100%}',
      '.mg-gomoku-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
      '.mg-gomoku-stone{position:absolute;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 1px 2px rgba(0,0,0,.35);pointer-events:none}',
      '.mg-gomoku-stone[data-color="1"]{background:radial-gradient(circle at 35% 30%,#4b4b4e,#101012)}',
      '.mg-gomoku-stone[data-color="2"]{background:radial-gradient(circle at 35% 30%,#ffffff,#d8d8db)}',
      '.mg-gomoku-stone[data-last="true"]{box-shadow:0 0 0 2px #e11d48,0 1px 2px rgba(0,0,0,.35)}',
      '.mg-gomoku-over{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}',
      '.mg-gomoku-over-title{font-size:14px;font-weight:600}',
      '.mg-gomoku-over-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      /* Xiangqi */
      '.mg-xq{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-xq-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:18px;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none}',
      '.mg-xq-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.mg-xq-board{position:relative;width:100%;aspect-ratio:8/9;height:auto;max-height:100%;box-sizing:border-box;padding:6%;border-radius:10px;background:linear-gradient(145deg,#e8cda6,#d8b385);box-shadow:inset 0 0 0 1px rgba(107,78,46,.35),0 1px 2px rgba(0,0,0,.18)}',
      '.mg-xq-grid{position:relative;width:100%;height:100%;container-type:inline-size}',
      '.mg-xq-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
      '.mg-xq-river{position:absolute;top:50%;transform:translateY(-50%);font-family:"KaiTi","STKaiti","Kaiti SC","楷体","Songti SC",serif;font-size:30px;font-size:9cqw;font-weight:600;line-height:1;letter-spacing:.18em;color:#7a5a34;opacity:.82;pointer-events:none;white-space:nowrap}',
      '.mg-xq-piece{position:absolute;transform:translate(-50%,-50%);width:11%;aspect-ratio:1;height:auto;min-height:0;box-sizing:border-box;padding:0;border-radius:999px;border:1px solid rgba(120,90,52,.85);background:radial-gradient(circle at 35% 30%,#fdf3df,#efd9b4);font-family:"KaiTi","STKaiti","Kaiti SC","楷体","Songti SC","Noto Serif SC",serif;font-size:28px;font-size:7.2cqw;font-weight:700;line-height:1;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:box-shadow .12s ease}',
      '.mg-xq-red{color:#b91c1c}',
      '.mg-xq-black{color:#1f2937}',
      '.mg-xq-piece.mg-xq-sel{box-shadow:0 0 0 3px #e11d48,0 1px 3px rgba(0,0,0,.4)}',
      '.mg-xq-dot{position:absolute;transform:translate(-50%,-50%);width:7.5%;aspect-ratio:1;padding:0;border:0;border-radius:50%;background:rgba(225,29,72,.4);cursor:pointer;z-index:2}',
      '.mg-xq-dot-cap{background:transparent;box-shadow:inset 0 0 0 2px rgba(225,29,72,.85)}',
      /* Go */
      '.mg-go{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-go-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:18px;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none}',
      '.mg-go-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.mg-go-board{position:relative;width:100%;aspect-ratio:1;height:auto;max-height:100%;box-sizing:border-box;padding:4.5%;border-radius:10px;background:linear-gradient(145deg,#e3c79c,#d3ad7c);box-shadow:inset 0 0 0 1px rgba(107,78,46,.35),0 1px 2px rgba(0,0,0,.18);cursor:pointer}',
      '.mg-go-grid{position:relative;width:100%;height:100%}',
      '.mg-go-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
      '.mg-go-stone{position:absolute;width:6.9%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 1px 2px rgba(0,0,0,.35);pointer-events:none}',
      '.mg-go-stone[data-color="1"]{background:radial-gradient(circle at 35% 30%,#4b4b4e,#101012)}',
      '.mg-go-stone[data-color="2"]{background:radial-gradient(circle at 35% 30%,#ffffff,#d8d8db)}',
      '.mg-dot-red{background:#b91c1c}',
      '.mg-gomoku-over-actions{display:flex;align-items:center;gap:8px;margin-top:4px}',
      '.mg-gomoku-setup{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:12px;overflow:auto}',
      '.mg-ai-box{display:flex;flex-direction:column;gap:6px;padding:9px 10px;border-radius:10px;border:1px dashed color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent)}',
      '.mg-ai-box-title{font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.mg-ai-box-note{font-size:10.5px;line-height:1.45;color:var(--dsw-alias-label-secondary)}',
      '.mg-ai-btn{align-self:flex-start;height:26px;padding:0 11px;border:0;border-radius:8px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,#fff);font-size:11.5px;font-weight:600;cursor:pointer}',
      '.mg-ai-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      /* 2048 — wireframe / functional */
      '.mg-2048{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-2048-hud{flex:none;display:flex;align-items:center;justify-content:space-between;height:24px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
      '.mg-2048 .mg-hud-label{font-size:9px;letter-spacing:.2em;text-transform:uppercase}',
      '.mg-2048 .mg-hud-value{font-size:18px;font-weight:600;letter-spacing:.01em}',
      '.mg-2048 .mg-hud-best{font-family:inherit;letter-spacing:.06em}',
      '.mg-2048-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.mg-2048-board{position:relative;width:100%;aspect-ratio:1;height:auto;max-height:100%;box-sizing:border-box;padding:3%;background:#ffffff;border:1px solid #0f1115;border-radius:10px}',
      '.mg-2048-grid{position:relative;width:100%;height:100%;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:3%}',
      '.mg-2048-cell{box-sizing:border-box;background:transparent;border:1px dashed rgba(15,23,42,.16);border-radius:4px}',
      '.mg-2048-tile{position:absolute;box-sizing:border-box;width:22.75%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:600;line-height:1;color:var(--tone,#0f1115);background:#ffffff;border:2px solid var(--tone,#0f1115);border-radius:6px;transition:left .1s ease,top .1s ease,background-color .12s ease,border-color .12s ease,color .12s ease;will-change:left,top}',
      '.mg-2048-len1,.mg-2048-len2{font-size:23px}',
      '.mg-2048-len3{font-size:19px}',
      '.mg-2048-len4{font-size:16px}',
      '.mg-2048-len5{font-size:13px}',
      '.mg-2048-v2{--tone:hsl(0 45% 46%)}',
      '.mg-2048-v4{--tone:hsl(36 45% 45%)}',
      '.mg-2048-v8{--tone:hsl(72 45% 44%)}',
      '.mg-2048-v16{--tone:hsl(108 45% 43%)}',
      '.mg-2048-v32{--tone:hsl(144 45% 42%)}',
      '.mg-2048-v64{--tone:hsl(180 45% 41%)}',
      '.mg-2048-v128{--tone:hsl(216 45% 42%)}',
      '.mg-2048-v256{--tone:hsl(252 45% 43%)}',
      '.mg-2048-v512{--tone:hsl(288 45% 44%)}',
      '.mg-2048-v1024{--tone:hsl(324 45% 45%)}',
      '.mg-2048-v2048{--tone:hsl(360 45% 46%)}',
      '.mg-2048-v4096{--tone:hsl(36 45% 45%)}',
      '.mg-2048-v128,.mg-2048-v256,.mg-2048-v512{border-width:2.5px}',
      '.mg-2048-v2048,.mg-2048-v4096{border-width:3px}',
      '@keyframes mg-2048-pop{from{transform:scale(.5);opacity:.4}to{transform:scale(1);opacity:1}}',
      '.mg-2048-new{animation:mg-2048-pop .14s ease-out}',
      '.mg-2048-merged{animation:mg-2048-pop .16s ease-out}',
      /* Tetris */
      '.mg-tetris{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-tetris-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:34px}',
      '.mg-tetris-meta{display:flex;gap:8px;font-size:10px;color:var(--dsw-alias-label-secondary)}',
      '.mg-tetris-next{display:grid;grid-template-columns:repeat(4,6px);grid-template-rows:repeat(4,6px);gap:1px;padding:2px;border-radius:4px;background:#eef0f2;border:1px solid rgba(15,23,42,.08)}',
      '.mg-tetris-ncell{background:#e8eaee;border-radius:1px}',
      '.mg-tetris-non{background:#1f2328}',
      '.mg-tetris-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.mg-tetris-board{height:100%;aspect-ratio:1/2;width:auto;max-width:100%;padding:9px;box-sizing:border-box;background:#ffffff;border:1px solid rgba(15,23,42,.12);border-radius:8px;box-shadow:0 1px 4px rgba(15,23,42,.1)}',
      '.mg-tetris-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));grid-template-rows:repeat(20,minmax(0,1fr));gap:5px;background:#ffffff;border-radius:5px;position:relative;isolation:isolate}',
      '.mg-tetris-cell{background:#f8fafc;border-radius:3px}',
      '.mg-tetris-seam{position:absolute;background:#dfe7f0;pointer-events:none;z-index:-1}',
      '.mg-tetris-on{background:#40464f}',
      /* Match-3 */
      '.mg-match{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-match-hud{flex:none;display:flex;align-items:center;justify-content:space-between;height:24px}',
      '.mg-match-body{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;container-type:size}',
      '.mg-match-board{position:relative;width:100%;max-width:100cqh;aspect-ratio:1;height:auto;max-height:100%;box-sizing:border-box;padding:2.5%;border-radius:12px;background:#ffffff;border:1px solid rgba(15,23,42,.1);box-shadow:0 1px 4px rgba(15,23,42,.08);overflow:hidden}',
      '.mg-match-grid{position:relative;width:100%;height:100%}',
      '.mg-match-cell{position:absolute;width:11%;aspect-ratio:1;border-radius:7px;background:#f3f4f6}',
      '.mg-match-tile{position:absolute;width:11%;aspect-ratio:1;padding:0;border:0;border-radius:7px;cursor:pointer;transition:left .14s ease,top .16s ease,transform .12s ease,opacity .12s ease,box-shadow .12s ease}',
      '.mg-match-tile:active{transform:scale(.94)}',
      '.mg-match-v0{background:#efb6b6}',
      '.mg-match-v1{background:#b7cdea}',
      '.mg-match-v2{background:#b9dfc9}',
      '.mg-match-v3{background:#f0dda6}',
      '.mg-match-v4{background:#cdc2e8}',
      '.mg-match-sel{box-shadow:0 0 0 3px #1f2328}',
      '.mg-match-pop{animation:mg-match-pop .15s ease forwards}',
      '@keyframes mg-match-pop{from{transform:scale(1);opacity:1}to{transform:scale(.2);opacity:0}}',
      '@keyframes mg-match-hint{0%,100%{box-shadow:0 0 0 2px rgba(31,35,40,.9)}50%{box-shadow:0 0 0 5px rgba(31,35,40,.25)}}',
      '.mg-match-hint{animation:mg-match-hint .9s ease-in-out infinite}',
      /* Breakout */
      '.mg-breakout{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:6px}',
      '.mg-breakout-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;height:24px}',
      '.mg-breakout-meta{display:flex;gap:12px;font-size:10px;color:var(--dsw-alias-label-secondary)}',
      '.mg-breakout-body{position:relative;flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;container-type:size}',
      '.mg-breakout-canvas{display:block;width:100%;max-width:150cqh;aspect-ratio:3/2;max-height:100%;border-radius:10px;background:#ffffff;border:1px solid rgba(15,23,42,.1);box-shadow:0 1px 4px rgba(15,23,42,.08);touch-action:none}',
      '.mg-breakout-tip{position:absolute;left:50%;bottom:18%;transform:translateX(-50%);padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.92);border:1px solid rgba(15,23,42,.1);font-size:11px;color:#1f2328;pointer-events:none;white-space:nowrap}',
      '.mg-breakout-hearts{position:relative;display:inline-flex;align-items:center;gap:4px}',
      '.mg-heart{width:16px;height:16px;display:block;color:#e11d48;fill:currentColor;transition:opacity .2s ease,color .2s ease}',
      '.mg-heart[data-lost="true"]{opacity:.35;color:#cbd5e1}',
      '.mg-breakout-lostheart{position:absolute;top:0;width:16px;height:16px;color:#e11d48;fill:currentColor;pointer-events:none;animation:mg-breakout-heart-fall 1.1s linear forwards}',
      '@keyframes mg-breakout-heart-fall{0%{opacity:1;transform:translateY(0) rotate(0deg)}15%{transform:translateY(-18px) rotate(-40deg)}30%{transform:translateY(-12px) rotate(10deg)}45%{transform:translateY(12px) rotate(80deg)}60%{transform:translateY(52px) rotate(150deg)}75%{transform:translateY(112px) rotate(220deg)}88%{opacity:1;transform:translateY(188px) rotate(280deg)}100%{opacity:0;transform:translateY(280px) rotate(340deg)}}',
      '@media (prefers-reduced-motion:reduce){.mg-panel,.mg-dock,.mg-view,.mg-card,.mg-console,.mg-launch,.mg-cbtn,.mg-caction,.mg-close,.mg-cell{transition:none}.mg-dot{animation:none}.mg-panel[data-shown="true"] .mg-card,.mg-panel[data-shown="true"] .mg-kicker-rule{animation:none}}',
    ].join('');

    /* Shelf entries. `w`/`h` are the frame the menu morphs into; `extra` is the
     * action that game adds to the console; `Game` makes it playable. */
    /* ---- Gomoku ---- */
    const GOMOKU_N = 15;
    const GOMOKU_SETTINGS_KEY = 'dsh-minigame-list.gomoku.settings';
    const GOMOKU_DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

    function readGomokuSettings() {
      try {
        const raw = window.localStorage.getItem(GOMOKU_SETTINGS_KEY);
        if (!raw) return { mode: 'solo', difficulty: 'normal', installed: false };
        const parsed = JSON.parse(raw);
        return {
          mode: parsed.mode === 'ai' ? 'ai' : 'solo',
          difficulty: parsed.difficulty === 'easy' || parsed.difficulty === 'hard' ? parsed.difficulty : 'normal',
          installed: parsed.installed === true,
        };
      } catch (error) {
        return { mode: 'solo', difficulty: 'normal', installed: false };
      }
    }

    function writeGomokuSettings(settings) {
      try {
        window.localStorage.setItem(GOMOKU_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        /* storage unavailable: settings then last for this page only */
      }
    }

    function gomokuNew() {
      return new Array(GOMOKU_N * GOMOKU_N).fill(0);
    }

    function gomokuWins(board, index, stone) {
      const x = index % GOMOKU_N;
      const y = Math.floor(index / GOMOKU_N);
      for (let d = 0; d < GOMOKU_DIRS.length; d += 1) {
        const dx = GOMOKU_DIRS[d][0];
        const dy = GOMOKU_DIRS[d][1];
        let count = 1;
        for (let s = -1; s <= 1; s += 2) {
          let nx = x + dx * s;
          let ny = y + dy * s;
          while (nx >= 0 && nx < GOMOKU_N && ny >= 0 && ny < GOMOKU_N
            && board[ny * GOMOKU_N + nx] === stone) {
            count += 1;
            nx += dx * s;
            ny += dy * s;
          }
        }
        if (count >= 5) return true;
      }
      return false;
    }

    function gomokuLineScore(board, index, stone) {
      const x = index % GOMOKU_N;
      const y = Math.floor(index / GOMOKU_N);
      let total = 0;
      for (let d = 0; d < GOMOKU_DIRS.length; d += 1) {
        const dx = GOMOKU_DIRS[d][0];
        const dy = GOMOKU_DIRS[d][1];
        let count = 1;
        let open = 0;
        for (let s = -1; s <= 1; s += 2) {
          let nx = x + dx * s;
          let ny = y + dy * s;
          let run = 0;
          while (nx >= 0 && nx < GOMOKU_N && ny >= 0 && ny < GOMOKU_N
            && board[ny * GOMOKU_N + nx] === stone) {
            run += 1;
            nx += dx * s;
            ny += dy * s;
          }
          count += run;
          if (nx >= 0 && nx < GOMOKU_N && ny >= 0 && ny < GOMOKU_N
            && board[ny * GOMOKU_N + nx] === 0) open += 1;
        }
        if (count >= 5) total += 1000000;
        else if (count === 4 && open === 2) total += 60000;
        else if (count === 4 && open === 1) total += 9000;
        else if (count === 3 && open === 2) total += 3200;
        else if (count === 3 && open === 1) total += 420;
        else if (count === 2 && open === 2) total += 130;
        else if (count === 2 && open === 1) total += 22;
        else if (count === 1 && open === 2) total += 6;
        else if (count === 1 && open === 1) total += 1;
      }
      return total;
    }

    function gomokuCandidates(board) {
      const list = [];
      for (let y = 0; y < GOMOKU_N; y += 1) {
        for (let x = 0; x < GOMOKU_N; x += 1) {
          const index = y * GOMOKU_N + x;
          if (board[index] !== 0) continue;
          let near = false;
          for (let dy = -2; dy <= 2 && !near; dy += 1) {
            for (let dx = -2; dx <= 2; dx += 1) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= GOMOKU_N || ny < 0 || ny >= GOMOKU_N) continue;
              if (board[ny * GOMOKU_N + nx] !== 0) { near = true; break; }
            }
          }
          if (near) list.push(index);
        }
      }
      if (list.length === 0) list.push(Math.floor((GOMOKU_N * GOMOKU_N) / 2));
      return list;
    }

    /* AI plays white (2): own win first, then the opponent's, then the best
     * attack + defence score; difficulty widens how many top moves it samples. */
    function gomokuReply(board, difficulty) {
      const scored = gomokuCandidates(board).map((index) => {
        const attack = gomokuLineScore(board, index, 2);
        const defend = gomokuLineScore(board, index, 1);
        return { index, attack, defend, value: attack * 1.02 + defend };
      });
      scored.sort((a, b) => b.value - a.value);
      for (let i = 0; i < scored.length; i += 1) {
        if (scored[i].attack >= 1000000) return scored[i].index;
      }
      for (let i = 0; i < scored.length; i += 1) {
        if (scored[i].defend >= 1000000) return scored[i].index;
      }
      if (difficulty === 'easy') {
        const pool = scored.slice(0, Math.min(6, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].index;
      }
      if (difficulty === 'normal') {
        const pool = scored.slice(0, Math.min(2, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].index;
      }
      return scored[0].index;
    }

    /* ---- Xiangqi ---- */
    const XQ_W = 9;
    const XQ_H = 10;
    const XQ_ROWS = [
      'rnbakabnr',
      '.........',
      '.c.....c.',
      'p.p.p.p.p',
      '.........',
      '.........',
      'P.P.P.P.P',
      '.C.....C.',
      '.........',
      'RNBAKABNR',
    ];
    const XQ_NAMES = {
      K: '帅', A: '仕', B: '相', N: '马', R: '车', C: '炮', P: '兵',
      k: '将', a: '士', b: '象', n: '马', r: '车', c: '炮', p: '卒',
    };

    function xqNew() {
      return XQ_ROWS.join('').split('').map((cell) => (cell === '.' ? '' : cell));
    }

    function xqColor(piece) {
      if (!piece) return '';
      return piece === piece.toUpperCase() ? 'r' : 'b';
    }

    function xqOther(color) {
      return color === 'r' ? 'b' : 'r';
    }

    function xqInPalace(color, x, y) {
      if (x < 3 || x > 5) return false;
      return color === 'r' ? (y >= 7 && y <= 9) : (y >= 0 && y <= 2);
    }

    function xqMoves(board, from) {
      const x = from % XQ_W;
      const y = Math.floor(from / XQ_W);
      const piece = board[from];
      if (!piece) return [];
      const color = xqColor(piece);
      const kind = piece.toUpperCase();
      const out = [];
      const push = (nx, ny, slide) => {
        if (nx < 0 || nx >= XQ_W || ny < 0 || ny >= XQ_H) return false;
        const target = board[ny * XQ_W + nx];
        if (!target) {
          out.push(ny * XQ_W + nx);
          return Boolean(slide);
        }
        if (xqColor(target) !== color) out.push(ny * XQ_W + nx);
        return false;
      };

      if (kind === 'R') {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          let nx = x + dx;
          let ny = y + dy;
          while (push(nx, ny, true)) { nx += dx; ny += dy; }
        });
      } else if (kind === 'C') {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          let nx = x + dx;
          let ny = y + dy;
          let screen = false;
          while (nx >= 0 && nx < XQ_W && ny >= 0 && ny < XQ_H) {
            const target = board[ny * XQ_W + nx];
            if (!screen) {
              if (!target) out.push(ny * XQ_W + nx);
              else screen = true;
            } else if (target) {
              if (xqColor(target) !== color) out.push(ny * XQ_W + nx);
              break;
            }
            nx += dx;
            ny += dy;
          }
        });
      } else if (kind === 'N') {
        [[1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1],
          [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0]]
          .forEach(([dx, dy, lx, ly]) => {
            if (board[(y + ly) * XQ_W + (x + lx)]) return;
            push(x + dx, y + dy, false);
          });
      } else if (kind === 'B') {
        [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= XQ_W || ny < 0 || ny >= XQ_H) return;
          if (color === 'r' ? ny < 5 : ny > 4) return;
          if (board[(y + dy / 2) * XQ_W + (x + dx / 2)]) return;
          push(nx, ny, false);
        });
      } else if (kind === 'A') {
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dy]) => {
          if (!xqInPalace(color, x + dx, y + dy)) return;
          push(x + dx, y + dy, false);
        });
      } else if (kind === 'K') {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          if (!xqInPalace(color, x + dx, y + dy)) return;
          push(x + dx, y + dy, false);
        });
      } else if (kind === 'P') {
        const forward = color === 'r' ? -1 : 1;
        push(x, y + forward, false);
        const crossed = color === 'r' ? y <= 4 : y >= 5;
        if (crossed) {
          push(x - 1, y, false);
          push(x + 1, y, false);
        }
      }
      return out;
    }

    function xqKingIndex(board, color) {
      const target = color === 'r' ? 'K' : 'k';
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] === target) return i;
      }
      return -1;
    }

    function xqAttacked(board, index, byColor) {
      for (let i = 0; i < board.length; i += 1) {
        const piece = board[i];
        if (!piece || xqColor(piece) !== byColor) continue;
        if (xqMoves(board, i).indexOf(index) >= 0) return true;
      }
      return false;
    }

    function xqInCheck(board, color) {
      const king = xqKingIndex(board, color);
      if (king < 0) return true;
      if (xqAttacked(board, king, xqOther(color))) return true;
      const enemy = xqKingIndex(board, xqOther(color));
      if (enemy >= 0 && enemy % XQ_W === king % XQ_W) {
        const x = king % XQ_W;
        const y1 = Math.min(Math.floor(king / XQ_W), Math.floor(enemy / XQ_W)) + 1;
        const y2 = Math.max(Math.floor(king / XQ_W), Math.floor(enemy / XQ_W));
        let clear = true;
        for (let y = y1; y < y2; y += 1) {
          if (board[y * XQ_W + x]) { clear = false; break; }
        }
        if (clear) return true;
      }
      return false;
    }

    function xqLegalMoves(board, from) {
      const piece = board[from];
      if (!piece) return [];
      const color = xqColor(piece);
      return xqMoves(board, from).filter((to) => {
        const next = board.slice();
        next[to] = piece;
        next[from] = '';
        return !xqInCheck(next, color);
      });
    }

    function xqHasMove(board, color) {
      for (let i = 0; i < board.length; i += 1) {
        if (!board[i] || xqColor(board[i]) !== color) continue;
        if (xqLegalMoves(board, i).length > 0) return true;
      }
      return false;
    }

    /* ---- Go ---- */
    const GO_N = 13;
    const GO_KOMI = 6.5;

    function goNew() {
      return new Array(GO_N * GO_N).fill(0);
    }

    function goNeighbors(index) {
      const x = index % GO_N;
      const y = Math.floor(index / GO_N);
      const out = [];
      if (x > 0) out.push(index - 1);
      if (x < GO_N - 1) out.push(index + 1);
      if (y > 0) out.push(index - GO_N);
      if (y < GO_N - 1) out.push(index + GO_N);
      return out;
    }

    function goGroup(board, index) {
      const color = board[index];
      const seen = new Set([index]);
      const stack = [index];
      const stones = [];
      let liberties = 0;
      while (stack.length > 0) {
        const current = stack.pop();
        stones.push(current);
        const neighbors = goNeighbors(current);
        for (let i = 0; i < neighbors.length; i += 1) {
          const next = neighbors[i];
          const value = board[next];
          if (value === 0) liberties += 1;
          else if (value === color && !seen.has(next)) {
            seen.add(next);
            stack.push(next);
          }
        }
      }
      return { stones, liberties };
    }

    function goTryMove(board, index, color) {
      if (board[index] !== 0) return null;
      const next = board.slice();
      next[index] = color;
      let captured = 0;
      const enemy = 3 - color;
      goNeighbors(index).forEach((neighbor) => {
        if (next[neighbor] !== enemy) return;
        const group = goGroup(next, neighbor);
        if (group.liberties > 0) return;
        group.stones.forEach((stone) => {
          next[stone] = 0;
          captured += 1;
        });
      });
      const own = goGroup(next, index);
      if (own.liberties === 0) return null;
      return { board: next, captured };
    }

    function goScore(board) {
      let black = 0;
      let white = 0;
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] === 1) black += 1;
        else if (board[i] === 2) white += 1;
      }
      const visited = new Array(board.length).fill(false);
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] !== 0 || visited[i]) continue;
        const region = [];
        const borders = new Set();
        const stack = [i];
        visited[i] = true;
        while (stack.length > 0) {
          const current = stack.pop();
          region.push(current);
          goNeighbors(current).forEach((next) => {
            if (board[next] === 0) {
              if (!visited[next]) {
                visited[next] = true;
                stack.push(next);
              }
            } else {
              borders.add(board[next]);
            }
          });
        }
        if (borders.size === 1) {
          if (borders.has(1)) black += region.length;
          else white += region.length;
        }
      }
      return { black, white };
    }

    const GAMES = [
      { id: 'snake', w: 400, h: 372, extra: 'speed', action: 'boost', Game: SnakeGame, live: true, Icon: SnakeIcon },
      { id: '2048', w: 360, h: 420, Game: Game2048, live: true, Icon: TilesIcon },
      { id: 'blocks', w: 270, h: 560, Game: TetrisGame, live: true, Icon: BlocksIcon },
      { id: 'mines', w: 420, h: 400, Game: MinesGame, live: true, Icon: MineIcon },
      { id: 'gomoku', w: 460, h: 520, Game: GomokuGame, live: true, Icon: GomokuIcon },
      { id: 'xiangqi', w: 480, h: 560, Game: XiangqiGame, live: true, Icon: XiangqiIcon },
      { id: 'go', w: 480, h: 540, extra: 'pass', action: 'pass', Game: GoGame, live: true, Icon: GoIcon },
      { id: 'match', w: 340, h: 380, extra: 'hint', action: 'hint', Game: MatchGame, live: true, Icon: MatchIcon },
      { id: 'breakout', w: 400, h: 300, extra: 'serve', action: 'serve', Game: BreakoutGame, live: true, Icon: BreakoutIcon },
    ];

    function snakeStart() {
      const snake = [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }];
      return {
        snake,
        dir: { x: 1, y: 0 },
        queue: [],
        food: snakeFood(snake),
        score: 0,
        phase: 'ready',
      };
    }

    /* Whatever direction the first key names, lay the body out behind that
     * heading from the same centered head. Otherwise pressing the reverse (or
     * the initial heading) would be rejected by the turn rules and never start
     * the run. */
    function snakeLaunch(dir) {
      const head = { x: 10, y: 7 };
      const snake = [
        head,
        { x: head.x - dir.x, y: head.y - dir.y },
        { x: head.x - dir.x * 2, y: head.y - dir.y * 2 },
      ];
      return {
        snake,
        dir,
        queue: [],
        food: snakeFood(snake),
        score: 0,
        phase: 'running',
      };
    }

    function snakeFood(snake) {
      for (let attempt = 0; attempt < 500; attempt += 1) {
        const point = {
          x: Math.floor(Math.random() * SNAKE_COLS),
          y: Math.floor(Math.random() * SNAKE_ROWS),
        };
        if (!snake.some((seg) => seg.x === point.x && seg.y === point.y)) return point;
      }
      return { x: 0, y: 0 };
    }

    function advanceSnake(game) {
      if (game.phase !== 'running') return game;
      const queue = game.queue || [];
      const wanted = queue.length ? queue[0] : game.dir;
      const dir = wanted.x === -game.dir.x && wanted.y === -game.dir.y ? game.dir : wanted;
      /* The board is a torus: leaving one edge enters from the opposite one, so
       * a missed turn costs a crossing rather than the run. */
      const nx = (game.snake[0].x + dir.x + SNAKE_COLS) % SNAKE_COLS;
      const ny = (game.snake[0].y + dir.y + SNAKE_ROWS) % SNAKE_ROWS;
      const willEat = nx === game.food.x && ny === game.food.y;
      const body = willEat ? game.snake : game.snake.slice(0, -1);
      const dead = body.some((seg) => seg.x === nx && seg.y === ny);
      if (dead) return Object.assign({}, game, { phase: 'over', dir, queue: [] });
      const snake = [{ x: nx, y: ny }].concat(willEat ? game.snake : game.snake.slice(0, -1));
      return Object.assign({}, game, {
        snake,
        dir,
        queue: queue.slice(1),
        score: willEat ? game.score + 10 : game.score,
        food: willEat ? snakeFood(snake) : game.food,
      });
    }

    function SnakeGame(props) {
      const { t, active, paused, boost, restartTick, onTogglePause } = props;
      const [game, setGame] = useState(snakeStart);
      const [best, setBest] = useState(readBest);
      const rootRef = useRef(null);
      const activeRef = useRef(active);
      activeRef.current = active;
      const bestRef = useRef(best);
      bestRef.current = best;
      const runBestRef = useRef(best);

      useEffect(() => {
        if (game.score > best) {
          setBest(game.score);
          writeBest(game.score);
        }
      }, [game.score, best]);

      /* Take keyboard focus on entry and after every resume so the arrow keys
       * drive the snake instead of scrolling the page. */
      useEffect(() => {
        if (paused || !rootRef.current) return;
        const node = rootRef.current;
        try {
          node.focus({ preventScroll: true });
        } catch (error) {
          node.focus();
        }
      }, [paused]);

      useEffect(() => {
        if (paused || game.phase !== 'running') return undefined;
        const step = boost ? 90 : 145;
        const id = window.setInterval(() => {
          setGame((current) => advanceSnake(current));
        }, step);
        return () => window.clearInterval(id);
      }, [paused, game.phase, boost]);

      const restart = useCallback(() => {
        runBestRef.current = bestRef.current;
        setGame(snakeStart());
        if (rootRef.current) rootRef.current.focus({ preventScroll: true });
      }, []);

      const lastRestart = useRef(restartTick);
      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        restart();
      }, [restartTick, restart]);

      const onKeyDown = useCallback((event) => {
        const target = event.target;
        const onButton = Boolean(target && target.tagName === 'BUTTON');
        const key = event.key;
        const dirs = {
          ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
          ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
          w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
          W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 },
        };
        const dir = dirs[key];
        if (dir) {
          event.preventDefault();
          if (paused) return;
          setGame((current) => {
            if (current.phase === 'over') return current;
            if (current.phase === 'ready') return snakeLaunch(dir);
            const queue = current.queue || [];
            const facing = queue.length ? queue[queue.length - 1] : current.dir;
            if (dir.x === -facing.x && dir.y === -facing.y) return current;
            if (dir.x === facing.x && dir.y === facing.y) return current;
            return Object.assign({}, current, {
              queue: queue.length >= 2 ? queue : queue.concat([dir]),
            });
          });
          return;
        }
        if (key === 'Enter') {
          if (onButton) return;
          if (game.phase === 'over') {
            event.preventDefault();
            restart();
          }
          return;
        }
        if (key === 'r' || key === 'R') {
          event.preventDefault();
          restart();
        }
      }, [game.phase, paused, onTogglePause, restart]);

      /* Document-level so a paused game resumes on Space without clicking the
       * console first. Keys are claimed only while focus is inside this widget
       * or on the page body, and never while a text field is focused — the
       * composer keeps its keystrokes. */
      useEffect(() => {
        const isEditable = (node) => Boolean(node && typeof node.closest === 'function'
          && node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
        const onDocumentKeyDown = (event) => {
          if (!activeRef.current) return;
          const target = event.target;
          const widget = rootRef.current && typeof rootRef.current.closest === 'function'
            ? rootRef.current.closest('.mg-root')
            : null;
          const insideWidget = Boolean(widget && target && widget.contains(target));
          const onPage = !target || target === document.body || target === document.documentElement;
          if (!insideWidget && !onPage) return;
          if (isEditable(target)) return;
          onKeyDown(event);
        };
        document.addEventListener('keydown', onDocumentKeyDown);
        return () => document.removeEventListener('keydown', onDocumentKeyDown);
      }, [onKeyDown]);

      const head = game.snake[0];
      const headKey = head.y * SNAKE_COLS + head.x;
      const bodyKeys = new Set();
      for (let i = 1; i < game.snake.length; i += 1) {
        bodyKeys.add(game.snake[i].y * SNAKE_COLS + game.snake[i].x);
      }
      const foodKey = game.food.y * SNAKE_COLS + game.food.x;
      const cells = [];
      for (let i = 0; i < SNAKE_COLS * SNAKE_ROWS; i += 1) {
        let className = 'mg-cell';
        if (i === headKey) className += ' mg-cell-head';
        else if (bodyKeys.has(i)) className += ' mg-cell-body';
        else if (i === foodKey) className += ' mg-cell-food';
        cells.push(h('div', { key: i, className }));
      }

      return h('div', {
        ref: rootRef,
        className: 'mg-snake',
        tabIndex: 0,
        role: 'group',
        'aria-label': t('snake'),
      },
        h('div', { className: 'mg-snake-hud' },
          h('div', { className: 'mg-hud-score' },
            h('span', { className: 'mg-hud-label' }, t('score')),
            h('span', { className: 'mg-hud-value' }, game.score),
          ),
          h('div', { className: 'mg-hud-right' },
            boost ? h('span', { className: 'mg-hud-boost' }, t('boostOn')) : null,
            h('span', { className: 'mg-hud-best', title: t('best') },
              h(StarGlyph, { size: 12 }),
              h('span', null, best),
            ),
          ),
        ),
        h('div', { className: 'mg-snake-board', 'aria-hidden': 'true' }, cells),
        game.phase === 'ready'
          ? h('div', { className: 'mg-snake-overlay' },
            h('div', { className: 'mg-snake-tip' }, t('startHint')),
            h('div', { className: 'mg-snake-tip-sub' }, t('keysHint')),
          )
          : null,
        game.phase === 'over'
          ? h('div', { className: 'mg-snake-overlay' },
            h('div', { className: 'mg-snake-over-title' }, t('gameOver')),
            h('div', { className: 'mg-snake-over-score' },
              h('span', null, t('score')),
              h('b', null, game.score),
            ),
            h('div', { className: 'mg-snake-over-best' }, t('best') + ' ' + best),
            game.score > runBestRef.current
              ? h('div', { className: 'mg-snake-record' }, t('newRecord'))
              : null,
            h('button', {
              type: 'button',
              className: 'mg-snake-restart',
              onClick: restart,
            }, t('restart')),
            h('div', { className: 'mg-snake-tip-sub' }, t('restartHint')),
          )
          : null,
      );
    }

    function MinesGame(props) {
      const { t, paused, restartTick, onFrame } = props;
      const [settings, setSettings] = useState(readMinesSettings);
      const [board, setBoard] = useState(() => {
        const initial = readMinesSettings();
        const initialSize = minesSize(initial.size);
        return makeMinesBoard({
          cols: initialSize.cols,
          rows: initialSize.rows,
          mines: minesCount(initialSize, minesDensity(initial.density)),
        });
      });
      const [status, setStatus] = useState('setup');
      const [elapsed, setElapsed] = useState(0);
      const lastExtra = useRef(restartTick);

      const size = minesSize(settings.size);
      const density = minesDensity(settings.density);
      const mineTotal = minesCount(size, density);

      /* The frame follows the chosen board size, so a bigger field grows the
       * whole window instead of squeezing the cells. */
      useEffect(() => {
        if (onFrame) onFrame(minesFrame(minesSize(settings.size)));
      }, [settings.size, onFrame]);

      const startGame = useCallback(() => {
        const nextSize = minesSize(settings.size);
        const nextDensity = minesDensity(settings.density);
        setBoard(makeMinesBoard({
          cols: nextSize.cols,
          rows: nextSize.rows,
          mines: minesCount(nextSize, nextDensity),
        }));
        setStatus('playing');
        setElapsed(0);
      }, [settings.size, settings.density]);

      /* The console "new game" bump starts a fresh board with the remembered
       * settings; entering the game itself always lands on the setup screen. */
      useEffect(() => {
        if (restartTick === lastExtra.current) return;
        lastExtra.current = restartTick;
        startGame();
      }, [restartTick, startGame]);

      useEffect(() => {
        if (status !== 'playing' || paused || !board.placed) return undefined;
        const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
        return () => window.clearInterval(id);
      }, [status, paused, board.placed]);

      const chooseSize = (id) => {
        const next = { ...settings, size: id };
        setSettings(next);
        writeMinesSettings(next);
      };

      const chooseDensity = (id) => {
        const next = { ...settings, density: id };
        setSettings(next);
        writeMinesSettings(next);
      };

      const toggleSafeFirst = () => {
        const next = { ...settings, safeFirst: !settings.safeFirst };
        setSettings(next);
        writeMinesSettings(next);
      };

      const reveal = (index) => {
        if (paused || status !== 'playing') return;
        const cell = board.cells[index];
        if (cell.open || cell.flag) return;
        const seeded = board.placed ? board : placeMines(board, index, settings.safeFirst);
        if (seeded.cells[index].mine) {
          const cells = seeded.cells.map((item) => (item.mine ? { ...item, open: true } : item));
          setBoard({ ...seeded, cells });
          setStatus('lost');
          return;
        }
        const result = openMinesArea(seeded, index);
        setBoard(result.board);
        if (result.won) setStatus('won');
      };

      const toggleFlag = (index) => {
        if (paused || status !== 'playing') return;
        const cell = board.cells[index];
        if (cell.open) return;
        const cells = board.cells.slice();
        cells[index] = { ...cell, flag: !cell.flag };
        setBoard({ ...board, cells });
      };

      if (status === 'setup') {
        return h('div', { className: 'mg-mines-setup' },
          h('div', { className: 'mg-mines-setup-head' },
            h('h3', null, t('mines')),
            h('p', null, t('setupHint')),
          ),
          h('div', { className: 'mg-mines-group' },
            h('span', { className: 'mg-mines-group-label' }, t('sizeLabel')),
            h('div', { className: 'mg-mines-chips' },
              MINES_SIZES.map((item) => h('button', {
                key: item.id,
                type: 'button',
                className: 'mg-chip',
                'aria-pressed': settings.size === item.id ? 'true' : 'false',
                onClick: () => chooseSize(item.id),
              },
                h('b', null, t(item.id)),
                h('span', null, item.cols + '\u00d7' + item.rows),
              )),
            ),
          ),
          h('div', { className: 'mg-mines-group' },
            h('span', { className: 'mg-mines-group-label' },
              t('densityLabel') + ' \u00b7 ' + mineTotal + ' ' + t('levelMines')),
            h('div', { className: 'mg-mines-chips' },
              MINES_DENSITIES.map((item) => h('button', {
                key: item.id,
                type: 'button',
                className: 'mg-chip',
                'aria-pressed': settings.density === item.id ? 'true' : 'false',
                onClick: () => chooseDensity(item.id),
              },
                h('b', null, t(item.id)),
                h('span', null, minesCount(size, item) + ' ' + t('levelMines')),
              )),
            ),
          ),
          h('button', {
            type: 'button',
            className: 'mg-mines-switch',
            role: 'switch',
            'aria-checked': settings.safeFirst ? 'true' : 'false',
            onClick: toggleSafeFirst,
          },
            h('span', null, t('safeFirst')),
            h('span', { className: 'mg-switch', 'aria-hidden': 'true' }),
          ),
          h('button', {
            type: 'button',
            className: 'mg-mines-start',
            onClick: startGame,
          }, t('start')),
        );
      }

      const flags = board.cells.reduce((count, cell) => count + (cell.flag ? 1 : 0), 0);
      const cells = [];
      for (let i = 0; i < board.cells.length; i += 1) {
        const cell = board.cells[i];
        const className = 'mg-mcell' + (cell.open ? ' mg-mcell-open' : '');
        cells.push(h('button', {
          key: i,
          type: 'button',
          className,
          'aria-label': (Math.floor(i / board.cols) + 1) + '-' + ((i % board.cols) + 1),
          onClick: () => reveal(i),
          onContextMenu: (event) => {
            event.preventDefault();
            toggleFlag(i);
          },
        },
          !cell.open && cell.flag ? h('span', { className: 'mg-mflag', 'aria-hidden': 'true' }) : null,
          cell.open && cell.mine ? h(MineIcon, { size: 13 }) : null,
          cell.open && !cell.mine && cell.n > 0
            ? h('span', { className: 'mg-mnum mg-mnum-' + cell.n }, cell.n)
            : null,
        ));
      }

      return h('div', { className: 'mg-mines' },
        h('div', { className: 'mg-mines-hud' },
          h('span', { className: 'mg-mines-hud-left', title: t('mines') },
            h(MineIcon, { size: 12 }),
            h('b', null, board.mines - flags),
          ),
          h('span', { className: 'mg-mines-clock' }, minesClock(elapsed)),
        ),
        h('div', { className: 'mg-mines-body' },
          h('div', {
            className: 'mg-mines-board',
            style: { '--mg-cols': String(board.cols) },
            onContextMenu: (event) => event.preventDefault(),
          }, cells),
        ),
        status === 'won' || status === 'lost'
          ? h('div', { className: 'mg-mines-over' },
            h('div', { className: 'mg-mines-over-title' }, status === 'won' ? t('win') : t('lose')),
            h('div', { className: 'mg-mines-over-meta' }, t('time') + ' ' + minesClock(elapsed)),
            h('div', { className: 'mg-mines-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn',
                onClick: startGame,
              }, t('restart')),
              h('button', {
                type: 'button', className: 'mg-mines-btn mg-mines-btn-ghost',
                onClick: () => setStatus('setup'),
              }, t('settingsBack')),
            ),
          )
          : null,
      );
    }

    function GomokuGame(props) {
      const { t, paused, restartTick } = props;
      const [settings, setSettings] = useState(readGomokuSettings);
      const [board, setBoard] = useState(gomokuNew);
      const [status, setStatus] = useState('setup');
      const [turn, setTurn] = useState(1);
      const [result, setResult] = useState(0);
      const [last, setLast] = useState(-1);
      const [thinking, setThinking] = useState(false);
      const lastExtra = useRef(restartTick);

      const save = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        writeGomokuSettings(next);
      };

      const startGame = useCallback(() => {
        setBoard(gomokuNew());
        setStatus('playing');
        setTurn(1);
        setResult(0);
        setLast(-1);
        setThinking(false);
      }, []);

      useEffect(() => {
        if (restartTick === lastExtra.current) return;
        lastExtra.current = restartTick;
        startGame();
      }, [restartTick, startGame]);

      /* White is the engine. It waits a beat so the move is visible, and a
       * pause cancels the pending turn instead of playing through the overlay. */
      useEffect(() => {
        if (settings.mode !== 'ai' || !settings.installed) return undefined;
        if (status !== 'playing' || turn !== 2 || result || paused) return undefined;
        setThinking(true);
        const id = window.setTimeout(() => {
          setThinking(false);
          const move = gomokuReply(board, settings.difficulty);
          if (board[move] !== 0) return;
          const next = board.slice();
          next[move] = 2;
          setBoard(next);
          setLast(move);
          if (gomokuWins(next, move, 2)) {
            setResult(2);
            setStatus('over');
          } else if (next.indexOf(0) === -1) {
            setResult(3);
            setStatus('over');
          } else {
            setTurn(1);
          }
        }, 320);
        return () => window.clearTimeout(id);
      }, [settings.mode, settings.installed, settings.difficulty, status, turn, result, paused, board]);

      const place = (index) => {
        if (paused || status !== 'playing' || result) return;
        if (board[index] !== 0) return;
        if (settings.mode === 'ai' && turn !== 1) return;
        const next = board.slice();
        next[index] = turn;
        setBoard(next);
        setLast(index);
        if (gomokuWins(next, index, turn)) {
          setResult(turn);
          setStatus('over');
          return;
        }
        if (next.indexOf(0) === -1) {
          setResult(3);
          setStatus('over');
          return;
        }
        setTurn(turn === 1 ? 2 : 1);
      };

      const onBoardClick = (event) => {
        if (paused || status !== 'playing' || result) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const stepX = rect.width / (GOMOKU_N - 1);
        const stepY = rect.height / (GOMOKU_N - 1);
        const x = Math.round((event.clientX - rect.left) / stepX);
        const y = Math.round((event.clientY - rect.top) / stepY);
        if (x < 0 || x >= GOMOKU_N || y < 0 || y >= GOMOKU_N) return;
        place(y * GOMOKU_N + x);
      };

      if (status === 'setup') {
        const ai = settings.mode === 'ai';
        return h('div', { className: 'mg-gomoku-setup' },
          h('div', { className: 'mg-mines-setup-head' },
            h('h3', null, t('gomoku')),
            h('p', null, t('gomokuHint')),
          ),
          h('div', { className: 'mg-mines-group' },
            h('span', { className: 'mg-mines-group-label' }, t('modeLabel')),
            h('div', { className: 'mg-mines-chips' },
              h('button', {
                type: 'button', className: 'mg-chip',
                'aria-pressed': settings.mode === 'solo' ? 'true' : 'false',
                onClick: () => save({ mode: 'solo' }),
              },
                h('b', null, t('solo')),
                h('span', null, t('soloHint')),
              ),
              h('button', {
                type: 'button', className: 'mg-chip',
                'aria-pressed': settings.mode === 'ai' ? 'true' : 'false',
                onClick: () => save({ mode: 'ai' }),
              },
                h('b', null, t('versus')),
                h('span', null, t('versusHint')),
              ),
            ),
          ),
          ai
            ? (settings.installed
              ? h('div', { className: 'mg-mines-group' },
                h('span', { className: 'mg-mines-group-label' }, t('difficultyLabel')),
                h('div', { className: 'mg-mines-chips' },
                  [['easy', 'diffEasy', 'diffEasyHint'], ['normal', 'diffNormal', 'diffNormalHint'], ['hard', 'diffHard', 'diffHardHint']]
                    .map(([id, labelKey, hintKey]) => h('button', {
                      key: id, type: 'button', className: 'mg-chip',
                      'aria-pressed': settings.difficulty === id ? 'true' : 'false',
                      onClick: () => save({ difficulty: id }),
                    },
                      h('b', null, t(labelKey)),
                      h('span', null, t(hintKey)),
                    )),
                ),
              )
              : h('div', { className: 'mg-ai-box' },
                h('div', { className: 'mg-ai-box-title' }, t('aiMissing')),
                h('div', { className: 'mg-ai-box-note' }, t('aiNote')),
                h('button', {
                  type: 'button', className: 'mg-ai-btn',
                  onClick: () => save({ installed: true }),
                }, t('aiInstall')),
              ))
            : null,
          h('button', {
            type: 'button',
            className: 'mg-mines-start',
            disabled: ai && !settings.installed,
            onClick: startGame,
          }, t('start')),
        );
      }

      const lines = [];
      const edge = 0.2;
      const inner = 100 - edge;
      for (let i = 0; i < GOMOKU_N; i += 1) {
        const raw = (i * 100) / (GOMOKU_N - 1);
        const p = raw <= 0 ? edge : (raw >= 100 ? inner : raw);
        lines.push(h('line', {
          key: 'v' + i, x1: p, y1: edge, x2: p, y2: inner, stroke: '#7a5a34', strokeWidth: 0.34, opacity: 0.5,
        }));
        lines.push(h('line', {
          key: 'h' + i, x1: edge, y1: p, x2: inner, y2: p, stroke: '#7a5a34', strokeWidth: 0.34, opacity: 0.5,
        }));
      }
      [[3, 3], [11, 3], [3, 11], [11, 11], [7, 7]].forEach(([sx, sy]) => {
        lines.push(h('circle', {
          key: 's' + sx + '-' + sy,
          cx: (sx * 100) / (GOMOKU_N - 1),
          cy: (sy * 100) / (GOMOKU_N - 1),
          r: 0.85, fill: '#7a5a34', opacity: 0.75,
        }));
      });

      const stones = [];
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] === 0) continue;
        stones.push(h('div', {
          key: i,
          className: 'mg-gomoku-stone',
          'data-color': String(board[i]),
          'data-last': i === last ? 'true' : 'false',
          style: {
            left: (((i % GOMOKU_N) * 100) / (GOMOKU_N - 1)) + '%',
            top: ((Math.floor(i / GOMOKU_N) * 100) / (GOMOKU_N - 1)) + '%',
            width: '6.6%',
            height: '6.6%',
          },
        }));
      }

      return h('div', { className: 'mg-gomoku' },
        h('div', { className: 'mg-gomoku-hud' },
          h('span', { className: 'mg-gomoku-turn' },
            h('span', { className: 'mg-turn-dot', 'data-color': String(turn), 'aria-hidden': 'true' }),
            thinking ? t('thinking') : (turn === 1 ? t('black') : t('white')),
          ),
          h('span', null,
            settings.mode === 'ai'
              ? t(settings.difficulty === 'easy' ? 'diffEasy' : settings.difficulty === 'hard' ? 'diffHard' : 'diffNormal')
              : t('soloHint')),
        ),
        h('div', { className: 'mg-gomoku-body' },
          h('div', { className: 'mg-gomoku-board' },
            h('div', { className: 'mg-gomoku-grid', onClick: onBoardClick },
              h('svg', {
                className: 'mg-gomoku-lines', viewBox: '0 0 100 100',
                preserveAspectRatio: 'none', 'aria-hidden': 'true',
              }, lines),
              stones,
            ),
          ),
        ),
        result
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' },
              t(result === 1 ? 'blackWins' : result === 2 ? 'whiteWins' : 'drawGame')),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn',
                onClick: startGame,
              }, t('restart')),
              h('button', {
                type: 'button', className: 'mg-mines-btn mg-mines-btn-ghost',
                onClick: () => setStatus('setup'),
              }, t('settingsBack')),
            ),
          )
          : null,
      );
    }

    function readBoardSettings(key) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return { mode: 'solo', difficulty: 'normal', installed: false };
        const parsed = JSON.parse(raw);
        return {
          mode: parsed.mode === 'ai' ? 'ai' : 'solo',
          difficulty: parsed.difficulty === 'easy' || parsed.difficulty === 'hard' ? parsed.difficulty : 'normal',
          installed: parsed.installed === true,
        };
      } catch (error) {
        return { mode: 'solo', difficulty: 'normal', installed: false };
      }
    }

    function writeBoardSettings(key, settings) {
      try {
        window.localStorage.setItem(key, JSON.stringify(settings));
      } catch (error) {
        /* storage unavailable: settings then last for this page only */
      }
    }

    function GameSetup(props) {
      const {
        t, title, hint, settings, onChange, onStart,
      } = props;
      const ai = settings.mode === 'ai';
      const chips = (items) => h('div', { className: 'mg-mines-chips' },
        items.map((item) => h('button', {
          key: item.id,
          type: 'button',
          className: 'mg-chip',
          'aria-pressed': item.active ? 'true' : 'false',
          onClick: item.onClick,
        },
          h('b', null, item.title),
          h('span', null, item.subtitle),
        )));
      return h('div', { className: 'mg-gomoku-setup' },
        h('div', { className: 'mg-mines-setup-head' },
          h('h3', null, title),
          h('p', null, hint),
        ),
        h('div', { className: 'mg-mines-group' },
          h('span', { className: 'mg-mines-group-label' }, t('modeLabel')),
          chips([
            {
              id: 'solo', title: t('solo'), subtitle: t('soloHint'), active: settings.mode === 'solo', onClick: () => onChange({ mode: 'solo' }),
            },
            {
              id: 'ai', title: t('versus'), subtitle: t('versusHint'), active: ai, onClick: () => onChange({ mode: 'ai' }),
            },
          ]),
        ),
        ai ? (settings.installed
          ? h('div', { className: 'mg-mines-group' },
            h('span', { className: 'mg-mines-group-label' }, t('difficultyLabel')),
            chips([
              {
                id: 'easy', title: t('diffEasy'), subtitle: t('diffEasyHint'), active: settings.difficulty === 'easy', onClick: () => onChange({ difficulty: 'easy' }),
              },
              {
                id: 'normal', title: t('diffNormal'), subtitle: t('diffNormalHint'), active: settings.difficulty === 'normal', onClick: () => onChange({ difficulty: 'normal' }),
              },
              {
                id: 'hard', title: t('diffHard'), subtitle: t('diffHardHint'), active: settings.difficulty === 'hard', onClick: () => onChange({ difficulty: 'hard' }),
              },
            ]))
          : h('div', { className: 'mg-ai-box' },
            h('div', { className: 'mg-ai-box-title' }, t('aiMissing')),
            h('div', { className: 'mg-ai-box-note' }, t('aiNote')),
            h('button', {
              type: 'button', className: 'mg-ai-btn', onClick: () => onChange({ installed: true }),
            }, t('aiInstall')),
          ))
          : null,
        h('button', {
          type: 'button',
          className: 'mg-mines-start',
          disabled: ai && !settings.installed,
          onClick: onStart,
        }, t('start')),
      );
    }

    const XQ_SETTINGS_KEY = 'dsh-minigame-list.xiangqi.settings';
    const XQ_VALUE = {
      R: 900, C: 450, N: 400, B: 200, A: 200, P: 100, K: 10000,
    };

    function xqAllMoves(board, color) {
      const out = [];
      for (let i = 0; i < board.length; i += 1) {
        if (!board[i] || xqColor(board[i]) !== color) continue;
        const moves = xqLegalMoves(board, i);
        for (let j = 0; j < moves.length; j += 1) out.push({ from: i, to: moves[j] });
      }
      return out;
    }

    function xqBestCapture(board, color) {
      let best = 0;
      for (let i = 0; i < board.length; i += 1) {
        if (!board[i] || xqColor(board[i]) !== color) continue;
        const moves = xqMoves(board, i);
        for (let j = 0; j < moves.length; j += 1) {
          const target = board[moves[j]];
          if (!target) continue;
          const value = XQ_VALUE[target.toUpperCase()] || 0;
          if (value > best) best = value;
        }
      }
      return best;
    }

    /* One-ply material search with a risk term: take material, give check, and
     * avoid leaving a piece hanging to the opponent's best capture. */
    function xqAiMove(board, color, difficulty) {
      const moves = xqAllMoves(board, color);
      if (moves.length === 0) return null;
      const foe = xqOther(color);
      const scored = moves.map((move) => {
        const next = board.slice();
        const captured = next[move.to];
        next[move.to] = next[move.from];
        next[move.from] = '';
        const gain = captured ? (XQ_VALUE[captured.toUpperCase()] || 0) : 0;
        const check = xqInCheck(next, foe) ? 40 : 0;
        const risk = xqBestCapture(next, foe) * 0.85;
        const pawn = (next[move.to] === 'P' && Math.floor(move.to / XQ_W) <= 4) ? 15 : 0;
        return { move, score: gain + check - risk + pawn };
      });
      scored.sort((a, b) => b.score - a.score);
      if (difficulty === 'easy') {
        const pool = scored.slice(0, Math.min(5, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].move;
      }
      if (difficulty === 'normal') {
        const pool = scored.slice(0, Math.min(2, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].move;
      }
      return scored[0].move;
    }

    function XiangqiGame(props) {
      const { t, paused, restartTick } = props;
      const [settings, setSettings] = useState(() => readBoardSettings(XQ_SETTINGS_KEY));
      const [board, setBoard] = useState(xqNew);
      const [turn, setTurn] = useState('r');
      const [selected, setSelected] = useState(-1);
      const [legal, setLegal] = useState([]);
      const [winner, setWinner] = useState('');
      const [status, setStatus] = useState('setup');
      const lastExtra = useRef(restartTick);

      const save = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        writeBoardSettings(XQ_SETTINGS_KEY, next);
      };

      const startGame = useCallback(() => {
        setBoard(xqNew());
        setTurn('r');
        setSelected(-1);
        setLegal([]);
        setWinner('');
        setStatus('playing');
      }, []);

      useEffect(() => {
        if (restartTick === lastExtra.current) return;
        lastExtra.current = restartTick;
        startGame();
      }, [restartTick, startGame]);

      useEffect(() => {
        if (settings.mode !== 'ai' || !settings.installed) return undefined;
        if (status !== 'playing' || turn !== 'b' || winner || paused) return undefined;
        const id = window.setTimeout(() => {
          const move = xqAiMove(board, 'b', settings.difficulty);
          if (!move) {
            setWinner('r');
            setStatus('over');
            return;
          }
          const next = board.slice();
          next[move.to] = next[move.from];
          next[move.from] = '';
          setBoard(next);
          setSelected(-1);
          setLegal([]);
          if (!xqHasMove(next, 'r')) {
            setWinner('b');
            setStatus('over');
          } else {
            setTurn('r');
          }
        }, 320);
        return () => window.clearTimeout(id);
      }, [settings.mode, settings.installed, settings.difficulty, status, turn, winner, paused, board]);

      const choose = (index) => {
        if (paused || status !== 'playing' || winner) return;
        if (settings.mode === 'ai' && turn !== 'r') return;
        const piece = board[index];
        if (piece && xqColor(piece) === turn) {
          if (selected === index) {
            setSelected(-1);
            setLegal([]);
            return;
          }
          setSelected(index);
          setLegal(xqLegalMoves(board, index));
          return;
        }
        setSelected(-1);
        setLegal([]);
      };

      const moveTo = (index) => {
        if (paused || status !== 'playing' || winner || selected < 0) return;
        if (legal.indexOf(index) < 0) return;
        if (settings.mode === 'ai' && turn !== 'r') return;
        const next = board.slice();
        next[index] = board[selected];
        next[selected] = '';
        const foe = xqOther(turn);
        setBoard(next);
        setSelected(-1);
        setLegal([]);
        if (!xqHasMove(next, foe)) {
          setWinner(turn);
          setStatus('over');
        } else {
          setTurn(foe);
        }
      };

      if (status === 'setup') {
        return h(GameSetup, {
          t, title: t('xiangqi'), hint: t('gomokuHint'), settings, onChange: save, onStart: startGame,
        });
      }

      const pieces = [];
      const dots = [];
      for (let i = 0; i < board.length; i += 1) {
        const left = (((i % XQ_W) * 100) / (XQ_W - 1)) + '%';
        const top = ((Math.floor(i / XQ_W) * 100) / (XQ_H - 1)) + '%';
        if (board[i]) {
          pieces.push(h('button', {
            key: 'p' + i,
            type: 'button',
            className: 'mg-xq-piece ' + (xqColor(board[i]) === 'r' ? 'mg-xq-red' : 'mg-xq-black')
              + (selected === i ? ' mg-xq-sel' : ''),
            style: { left, top },
            'aria-label': XQ_NAMES[board[i]],
            onClick: () => choose(i),
          }, XQ_NAMES[board[i]]));
        }
        if (legal.indexOf(i) >= 0) {
          dots.push(h('button', {
            key: 'd' + i,
            type: 'button',
            className: 'mg-xq-dot' + (board[i] ? ' mg-xq-dot-cap' : ''),
            style: { left, top },
            'aria-label': 'move',
            onClick: () => moveTo(i),
          }));
        }
      }

      const lines = [];
      for (let x = 0; x < XQ_W; x += 1) {
        const edge = x === 0 || x === XQ_W - 1;
        const spans = edge ? [[0, XQ_H - 1]] : [[0, 4], [5, XQ_H - 1]];
        const px = edge ? (x === 0 ? 0.0225 : XQ_W - 1 - 0.0225) : x;
        spans.forEach(([y1, y2], s) => {
          lines.push(h('line', {
            key: 'v' + x + '-' + s,
            x1: px,
            y1: Math.max(y1, 0.0225),
            x2: px,
            y2: Math.min(y2, XQ_H - 1 - 0.0225),
            stroke: '#6b4e2e', strokeWidth: 0.045, opacity: 0.55,
          }));
        });
      }
      for (let y = 0; y < XQ_H; y += 1) {
        const py = y === 0 ? 0.0225 : (y === XQ_H - 1 ? XQ_H - 1 - 0.0225 : y);
        lines.push(h('line', {
          key: 'h' + y,
          x1: 0.0225,
          y1: py,
          x2: XQ_W - 1 - 0.0225,
          y2: py,
          stroke: '#6b4e2e', strokeWidth: 0.045, opacity: 0.55,
        }));
      }
      [[3, 0, 5, 2], [5, 0, 3, 2], [3, 7, 5, 9], [5, 7, 3, 9]].forEach(([x1, y1, x2, y2], i) => {
        lines.push(h('line', {
          key: 'x' + i, x1, y1, x2, y2, stroke: '#6b4e2e', strokeWidth: 0.045, opacity: 0.55,
        }));
      });

      return h('div', { className: 'mg-xq' },
        h('div', { className: 'mg-xq-hud' },
          h('span', { className: 'mg-gomoku-turn' },
            h('span', {
              className: 'mg-turn-dot' + (turn === 'r' ? ' mg-dot-red' : ''),
              'aria-hidden': 'true',
            }),
            t(turn === 'r' ? 'red' : 'blackSide'),
          ),
          h('span', null, winner ? t(winner === 'r' ? 'red' : 'blackSide') + ' ' + t('wins') : ''),
        ),
        h('div', { className: 'mg-xq-body' },
          h('div', { className: 'mg-xq-board' },
            h('div', { className: 'mg-xq-grid' },
              h('svg', {
                className: 'mg-xq-lines', viewBox: '0 0 8 9',
                preserveAspectRatio: 'none', 'aria-hidden': 'true',
              }, lines),
              h('span', { className: 'mg-xq-river', style: { left: '18%' } }, '楚河'),
              h('span', { className: 'mg-xq-river', style: { right: '18%' } }, '汉界'),
              pieces,
              dots,
            ),
          ),
        ),
        winner
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' },
              t(winner === 'r' ? 'red' : 'blackSide') + ' ' + t('wins')),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn', onClick: startGame,
              }, t('restart')),
              h('button', {
                type: 'button', className: 'mg-mines-btn mg-mines-btn-ghost',
                onClick: () => setStatus('setup'),
              }, t('settingsBack')),
            ),
          )
          : null,
      );
    }

    const GO_SETTINGS_KEY = 'dsh-minigame-list.go.settings';

    function goLegalMoves(board, color, ko) {
      const out = [];
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] !== 0) continue;
        const result = goTryMove(board, i, color);
        if (!result) continue;
        if (result.board.join('') === ko) continue;
        out.push({ index: i, result });
      }
      return out;
    }

    /* Shallow heuristic: captures, rescuing own groups in atari, pressing enemy
     * groups, proximity, and a penalty for filling its own eye. */
    function goAiMove(board, color, ko, difficulty) {
      const moves = goLegalMoves(board, color, ko);
      if (moves.length === 0) return null;
      const enemy = 3 - color;
      const scored = moves.map((move) => {
        let score = move.result.captured * 30;
        const neighbors = goNeighbors(move.index);
        let adjacent = 0;
        let ownEye = neighbors.length > 0;
        neighbors.forEach((n) => {
          if (board[n] !== 0) adjacent += 1;
          if (board[n] !== color) ownEye = false;
          if (board[n] === color) {
            const group = goGroup(board, n);
            if (group.liberties === 1 && group.stones.length > 1) score += 20;
          } else if (board[n] === enemy) {
            const group = goGroup(board, n);
            if (group.liberties === 1) score += 12;
          }
        });
        score += adjacent * 4;
        if (ownEye && move.result.captured === 0) score -= 60;
        return { move, score };
      });
      scored.sort((a, b) => b.score - a.score);
      if (difficulty === 'easy') {
        const pool = scored.slice(0, Math.min(8, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].move.index;
      }
      if (difficulty === 'normal') {
        const pool = scored.slice(0, Math.min(3, scored.length));
        return pool[Math.floor(Math.random() * pool.length)].move.index;
      }
      return scored[0].move.index;
    }

    function GoGame(props) {
      const { t, paused, extraTick, restartTick } = props;
      const [settings, setSettings] = useState(() => readBoardSettings(GO_SETTINGS_KEY));
      const [board, setBoard] = useState(goNew);
      const [turn, setTurn] = useState(1);
      const [captured, setCaptured] = useState({ 1: 0, 2: 0 });
      const [passed, setPassed] = useState(0);
      const [ko, setKo] = useState('');
      const [status, setStatus] = useState('setup');
      const [score, setScore] = useState(null);
      const lastExtra = useRef(extraTick);

      const save = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        writeBoardSettings(GO_SETTINGS_KEY, next);
      };

      const startGame = useCallback(() => {
        setBoard(goNew());
        setTurn(1);
        setCaptured({ 1: 0, 2: 0 });
        setPassed(0);
        setKo('');
        setScore(null);
        setStatus('playing');
      }, []);

      const lastRestart = useRef(restartTick);
      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        startGame();
      }, [restartTick, startGame]);

      const commit = (result, index) => {
        setKo(board.join(''));
        setBoard(result.board);
        setPassed(0);
        if (result.captured > 0) {
          setCaptured((current) => ({ ...current, [turn]: current[turn] + result.captured }));
        }
        setTurn(3 - turn);
      };

      const doPass = useCallback(() => {
        if (paused || status !== 'playing') return;
        const next = passed + 1;
        setKo('');
        if (next >= 2) {
          setScore(goScore(board));
          setStatus('over');
          return;
        }
        setPassed(next);
        setTurn(3 - turn);
      }, [paused, status, passed, board, turn]);

      const passRef = useRef(doPass);
      passRef.current = doPass;

      useEffect(() => {
        if (extraTick === lastExtra.current) return;
        lastExtra.current = extraTick;
        passRef.current();
      }, [extraTick]);

      useEffect(() => {
        if (settings.mode !== 'ai' || !settings.installed) return undefined;
        if (status !== 'playing' || turn !== 2 || paused) return undefined;
        const id = window.setTimeout(() => {
          const index = goAiMove(board, 2, ko, settings.difficulty);
          if (index === null) {
            doPass();
            return;
          }
          const result = goTryMove(board, index, 2);
          if (!result) {
            doPass();
            return;
          }
          commit(result, index);
        }, 320);
        return () => window.clearTimeout(id);
      }, [settings.mode, settings.installed, settings.difficulty, status, turn, paused, board, ko, doPass, commit]);

      const place = (index) => {
        if (paused || status !== 'playing') return;
        if (settings.mode === 'ai' && turn !== 1) return;
        const result = goTryMove(board, index, turn);
        if (!result) return;
        if (result.board.join('') === ko) return;
        commit(result, index);
      };

      const onBoardClick = (event) => {
        if (paused || status !== 'playing') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const stepX = rect.width / (GO_N - 1);
        const stepY = rect.height / (GO_N - 1);
        const x = Math.round((event.clientX - rect.left) / stepX);
        const y = Math.round((event.clientY - rect.top) / stepY);
        if (x < 0 || x >= GO_N || y < 0 || y >= GO_N) return;
        place(y * GO_N + x);
      };

      if (status === 'setup') {
        return h(GameSetup, {
          t, title: t('go'), hint: t('gomokuHint'), settings, onChange: save, onStart: startGame,
        });
      }

      const lines = [];
      const edge = 0.03;
      const inner = GO_N - 1 - edge;
      for (let i = 0; i < GO_N; i += 1) {
        const p = i === 0 ? edge : (i === GO_N - 1 ? inner : i);
        lines.push(h('line', {
          key: 'v' + i, x1: p, y1: edge, x2: p, y2: inner,
          stroke: '#6b4e2e', strokeWidth: 0.06, opacity: 0.55,
        }));
        lines.push(h('line', {
          key: 'h' + i, x1: edge, y1: p, x2: inner, y2: p,
          stroke: '#6b4e2e', strokeWidth: 0.06, opacity: 0.55,
        }));
      }
      [[3, 3], [9, 3], [3, 9], [9, 9], [6, 6]].forEach(([sx, sy]) => {
        lines.push(h('circle', {
          key: 's' + sx + '-' + sy, cx: sx, cy: sy, r: 0.14, fill: '#6b4e2e', opacity: 0.65,
        }));
      });

      const stones = [];
      for (let i = 0; i < board.length; i += 1) {
        if (board[i] === 0) continue;
        stones.push(h('div', {
          key: i,
          className: 'mg-go-stone',
          'data-color': String(board[i]),
          style: {
            left: (((i % GO_N) * 100) / (GO_N - 1)) + '%',
            top: ((Math.floor(i / GO_N) * 100) / (GO_N - 1)) + '%',
          },
        }));
      }

      const blackArea = score ? score.black : 0;
      const whiteArea = score ? score.white + GO_KOMI : 0;
      const resultText = !score ? '' : blackArea > whiteArea
        ? t('black') + ' ' + t('wins')
        : whiteArea > blackArea ? t('white') + ' ' + t('wins') : t('drawGame');

      return h('div', { className: 'mg-go' },
        h('div', { className: 'mg-go-hud' },
          h('span', { className: 'mg-gomoku-turn' },
            h('span', { className: 'mg-turn-dot', 'data-color': String(turn), 'aria-hidden': 'true' }),
            t(turn === 1 ? 'black' : 'white'),
          ),
          h('span', null, t('captured') + ' ' + captured[1] + '/' + captured[2]),
        ),
        h('div', { className: 'mg-go-body' },
          h('div', { className: 'mg-go-board' },
            h('div', { className: 'mg-go-grid', onClick: onBoardClick },
              h('svg', {
                className: 'mg-go-lines', viewBox: '0 0 12 12',
                preserveAspectRatio: 'none', 'aria-hidden': 'true',
              }, lines),
              stones,
            ),
          ),
        ),
        status === 'over'
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' }, resultText),
            h('div', { className: 'mg-gomoku-over-meta' },
              t('black') + ' ' + blackArea + ' · ' + t('white') + ' ' + whiteArea.toFixed(1)
                + ' (' + t('komi') + ' ' + GO_KOMI + ')'),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn', onClick: startGame,
              }, t('restart')),
              h('button', {
                type: 'button', className: 'mg-mines-btn mg-mines-btn-ghost',
                onClick: () => setStatus('setup'),
              }, t('settingsBack')),
            ),
          )
          : null,
      );
    }

    const G2048_BEST_KEY = 'dsh-minigame-list.2048.best';
    let g2048Seq = 0;

    function readG2048Best() {
      try {
        const value = Number(window.localStorage.getItem(G2048_BEST_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch (error) {
        return 0;
      }
    }

    function writeG2048Best(value) {
      try {
        window.localStorage.setItem(G2048_BEST_KEY, String(value));
      } catch (error) {
        /* storage unavailable: the record then lasts for this page only */
      }
    }

    function g2048LineCoords(line, index, dir) {
      if (dir === 'left') return [line, index];
      if (dir === 'right') return [line, 3 - index];
      if (dir === 'up') return [index, line];
      return [3 - index, line];
    }

    function g2048MakeTile(value, row, col, isNew) {
      g2048Seq += 1;
      return {
        id: g2048Seq, value, row, col, isNew: Boolean(isNew), merged: false,
      };
    }

    function g2048Spawn(tiles) {
      const occupied = new Set(tiles.map((tile) => tile.row * 4 + tile.col));
      const empty = [];
      for (let i = 0; i < 16; i += 1) if (!occupied.has(i)) empty.push(i);
      if (empty.length === 0) return tiles;
      const cell = empty[Math.floor(Math.random() * empty.length)];
      return tiles.concat([g2048MakeTile(
        Math.random() < 0.9 ? 2 : 4,
        Math.floor(cell / 4),
        cell % 4,
        true,
      )]);
    }

    function g2048Start() {
      return g2048Spawn(g2048Spawn([]));
    }

    function g2048Move(tiles, dir) {
      const grid = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
      tiles.forEach((tile) => { grid[tile.row][tile.col] = tile; });
      const result = [];
      let gained = 0;
      let moved = false;
      for (let line = 0; line < 4; line += 1) {
        const column = [];
        for (let i = 0; i < 4; i += 1) {
          const coords = g2048LineCoords(line, i, dir);
          const tile = grid[coords[0]][coords[1]];
          if (tile) column.push(tile);
        }
        const packed = [];
        for (let i = 0; i < column.length; i += 1) {
          const tile = column[i];
          if (i + 1 < column.length && column[i + 1].value === tile.value) {
            packed.push({ tile, value: tile.value * 2, merged: true });
            gained += tile.value * 2;
            i += 1;
          } else {
            packed.push({ tile, value: tile.value, merged: false });
          }
        }
        packed.forEach((entry, index) => {
          const coords = g2048LineCoords(line, index, dir);
          if (entry.tile.row !== coords[0] || entry.tile.col !== coords[1]) moved = true;
          if (entry.merged) moved = true;
          result.push({
            id: entry.tile.id,
            value: entry.value,
            row: coords[0],
            col: coords[1],
            isNew: false,
            merged: entry.merged,
          });
        });
      }
      return { tiles: result, gained, moved };
    }

    function g2048HasMoves(tiles) {
      if (tiles.length < 16) return true;
      const grid = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      tiles.forEach((tile) => { grid[tile.row][tile.col] = tile.value; });
      for (let row = 0; row < 4; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const value = grid[row][col];
          if (col < 3 && grid[row][col + 1] === value) return true;
          if (row < 3 && grid[row + 1][col] === value) return true;
        }
      }
      return false;
    }

    function Game2048(props) {
      const { t, paused, active, restartTick } = props;
      const [tiles, setTiles] = useState(g2048Start);
      const [score, setScore] = useState(0);
      const [best, setBest] = useState(readG2048Best);
      const [status, setStatus] = useState('playing');
      const [ack, setAck] = useState(false);
      const rootRef = useRef(null);
      const pausedRef = useRef(paused);
      pausedRef.current = paused;
      const activeRef = useRef(active);
      activeRef.current = active;
      const tilesRef = useRef(tiles);
      tilesRef.current = tiles;
      const statusRef = useRef(status);
      statusRef.current = status;
      const ackRef = useRef(ack);
      ackRef.current = ack;
      const bestRef = useRef(best);
      bestRef.current = best;
      const lastRestart = useRef(restartTick);

      const restart = useCallback(() => {
        setTiles(g2048Start());
        setScore(0);
        setStatus('playing');
        setAck(false);
      }, []);

      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        restart();
      }, [restartTick, restart]);

      useEffect(() => {
        if (score > best) {
          setBest(score);
          writeG2048Best(score);
        }
      }, [score, best]);

      const move = useCallback((dir) => {
        if (pausedRef.current || statusRef.current === 'over') return;
        if (statusRef.current === 'won') return;
        const result = g2048Move(tilesRef.current, dir);
        if (!result.moved) return;
        const next = g2048Spawn(result.tiles);
        tilesRef.current = next;
        setTiles(next);
        if (result.gained > 0) setScore((value) => value + result.gained);
        const top = next.reduce((max, tile) => Math.max(max, tile.value), 0);
        if (top >= 2048 && !ackRef.current) {
          setStatus('won');
        } else if (!g2048HasMoves(next)) {
          setStatus('over');
        }
      }, []);

      useEffect(() => {
        const isEditable = (node) => Boolean(node && typeof node.closest === 'function'
          && node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
        const keys = {
          ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
          a: 'left', d: 'right', w: 'up', s: 'down',
          A: 'left', D: 'right', W: 'up', S: 'down',
        };
        const onKeyDown = (event) => {
          if (!activeRef.current || pausedRef.current) return;
          const target = event.target;
          const widget = rootRef.current && typeof rootRef.current.closest === 'function'
            ? rootRef.current.closest('.mg-root')
            : null;
          const inside = Boolean(widget && target && widget.contains(target));
          const onPage = !target || target === document.body || target === document.documentElement;
          if (!inside && !onPage) return;
          if (isEditable(target)) return;
          const dir = keys[event.key];
          if (!dir) return;
          event.preventDefault();
          move(dir);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
      }, [move]);

      const continueGame = () => {
        setAck(true);
        setStatus('playing');
      };

      const cells = [];
      for (let i = 0; i < 16; i += 1) cells.push(h('div', { key: i, className: 'mg-2048-cell' }));

      const tileViews = tiles.map((tile) => {
        const length = String(tile.value).length;
        return h('div', {
          key: tile.id,
          className: 'mg-2048-tile mg-2048-v' + Math.min(tile.value, 4096)
            + ' mg-2048-len' + Math.min(length, 5)
            + (tile.isNew ? ' mg-2048-new' : '')
            + (tile.merged ? ' mg-2048-merged' : ''),
          style: {
            left: (tile.col * 25.75) + '%',
            top: (tile.row * 25.75) + '%',
          },
        }, tile.value);
      });

      return h('div', { className: 'mg-2048', ref: rootRef },
        h('div', { className: 'mg-2048-hud' },
          h('div', { className: 'mg-hud-score' },
            h('span', { className: 'mg-hud-label' }, t('score')),
            h('span', { className: 'mg-hud-value' }, score),
          ),
          h('div', { className: 'mg-hud-right' },
            h('span', { className: 'mg-hud-best', title: t('best') },
              h(StarGlyph, { size: 12 }),
              h('span', null, best),
            ),
          ),
        ),
        h('div', { className: 'mg-2048-body' },
          h('div', { className: 'mg-2048-board' },
            h('div', { className: 'mg-2048-grid' },
              cells,
              tileViews,
            ),
          ),
        ),
        status === 'won'
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' }, t('reached2048')),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn', onClick: continueGame,
              }, t('keepGoing')),
              h('button', {
                type: 'button', className: 'mg-mines-btn mg-mines-btn-ghost',
                onClick: restart,
              }, t('restart')),
            ),
          )
          : null,
        status === 'over'
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' }, t('noMoves')),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn', onClick: restart,
              }, t('restart')),
            ),
          )
          : null,
      );
    }

    const TETRIS_COLS = 10;
    const TETRIS_ROWS = 20;
    const TETRIS_SHAPES = {
      I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      O: [[1, 1], [1, 1]],
      T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    };
    const TETRIS_BAG = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    function tetrisRandomType() {
      return TETRIS_BAG[Math.floor(Math.random() * TETRIS_BAG.length)];
    }

    function tetrisGrid() {
      return Array.from({ length: TETRIS_ROWS }, () => new Array(TETRIS_COLS).fill(''));
    }

    function tetrisPiece(type) {
      const matrix = TETRIS_SHAPES[type].map((row) => row.slice());
      return {
        type,
        matrix,
        x: Math.floor((TETRIS_COLS - matrix[0].length) / 2),
        y: 0,
      };
    }

    function tetrisNew() {
      return {
        grid: tetrisGrid(),
        piece: tetrisPiece(tetrisRandomType()),
        nextType: tetrisRandomType(),
        score: 0,
        lines: 0,
        level: 1,
        status: 'ready',
      };
    }

    function tetrisCollide(grid, matrix, x, y) {
      for (let r = 0; r < matrix.length; r += 1) {
        for (let c = 0; c < matrix[r].length; c += 1) {
          if (!matrix[r][c]) continue;
          const gx = x + c;
          const gy = y + r;
          if (gx < 0 || gx >= TETRIS_COLS || gy >= TETRIS_ROWS) return true;
          if (gy >= 0 && grid[gy][gx]) return true;
        }
      }
      return false;
    }

    function tetrisRotateMatrix(matrix) {
      const size = matrix.length;
      const out = Array.from({ length: size }, () => new Array(size).fill(0));
      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) out[c][size - 1 - r] = matrix[r][c];
      }
      return out;
    }

    function tetrisClearRows(grid) {
      const kept = grid.filter((row) => row.some((cell) => !cell));
      const cleared = TETRIS_ROWS - kept.length;
      while (kept.length < TETRIS_ROWS) kept.unshift(new Array(TETRIS_COLS).fill(''));
      return { grid: kept, cleared };
    }

    function tetrisLock(game) {
      const grid = game.grid.map((row) => row.slice());
      game.piece.matrix.forEach((row, r) => {
        row.forEach((value, c) => {
          if (!value) return;
          const gy = game.piece.y + r;
          const gx = game.piece.x + c;
          if (gy >= 0 && gy < TETRIS_ROWS && gx >= 0 && gx < TETRIS_COLS) grid[gy][gx] = game.piece.type;
        });
      });
      const clearedOut = tetrisClearRows(grid);
      const lines = game.lines + clearedOut.cleared;
      const level = 1 + Math.floor(lines / 10);
      const scores = [0, 100, 300, 500, 800];
      const score = game.score + (scores[clearedOut.cleared] || 0) * game.level;
      const spawned = tetrisPiece(game.nextType);
      const next = {
        ...game,
        grid: clearedOut.grid,
        piece: spawned,
        nextType: tetrisRandomType(),
        score,
        lines,
        level,
      };
      if (tetrisCollide(next.grid, spawned.matrix, spawned.x, spawned.y)) next.status = 'over';
      return next;
    }

    function tetrisStep(game) {
      if (game.status !== 'playing') return game;
      if (!tetrisCollide(game.grid, game.piece.matrix, game.piece.x, game.piece.y + 1)) {
        return { ...game, piece: { ...game.piece, y: game.piece.y + 1 } };
      }
      return tetrisLock(game);
    }

    function tetrisMove(game, dx) {
      if (game.status !== 'playing') return game;
      if (tetrisCollide(game.grid, game.piece.matrix, game.piece.x + dx, game.piece.y)) return game;
      return { ...game, piece: { ...game.piece, x: game.piece.x + dx } };
    }

    function tetrisRotate(game) {
      if (game.status !== 'playing') return game;
      const matrix = tetrisRotateMatrix(game.piece.matrix);
      const kicks = [0, -1, 1, -2, 2];
      for (let i = 0; i < kicks.length; i += 1) {
        const x = game.piece.x + kicks[i];
        if (!tetrisCollide(game.grid, matrix, x, game.piece.y)) {
          return { ...game, piece: { ...game.piece, matrix, x } };
        }
      }
      return game;
    }

    function tetrisHardDrop(game) {
      if (game.status !== 'playing') return game;
      let y = game.piece.y;
      while (!tetrisCollide(game.grid, game.piece.matrix, game.piece.x, y + 1)) y += 1;
      return tetrisLock({ ...game, piece: { ...game.piece, y } });
    }

    const TETRIS_BEST_KEY = 'dsh-minigame-list.tetris.best';

    function readTetrisBest() {
      try {
        const value = Number(window.localStorage.getItem(TETRIS_BEST_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch (error) {
        return 0;
      }
    }

    function writeTetrisBest(value) {
      try {
        window.localStorage.setItem(TETRIS_BEST_KEY, String(value));
      } catch (error) {
        /* storage unavailable: the record then lasts for this page only */
      }
    }

    function TetrisGame(props) {
      const {
        t, paused, active, restartTick, onTogglePause,
      } = props;
      const [game, setGame] = useState(tetrisNew);
      const [best, setBest] = useState(readTetrisBest);
      const rootRef = useRef(null);
      const pausedRef = useRef(paused);
      pausedRef.current = paused;
      const activeRef = useRef(active);
      activeRef.current = active;
      const lastRestart = useRef(restartTick);

      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        setGame(tetrisNew());
      }, [restartTick]);

      useEffect(() => {
        if (game.score > best) {
          setBest(game.score);
          writeTetrisBest(game.score);
        }
      }, [game.score, best]);

      useEffect(() => {
        if (paused || game.status !== 'playing') return undefined;
        const speed = Math.max(120, 800 - (game.level - 1) * 70);
        const id = window.setInterval(() => setGame((current) => tetrisStep(current)), speed);
        return () => window.clearInterval(id);
      }, [paused, game.status, game.level]);

      useEffect(() => {
        const isEditable = (node) => Boolean(node && typeof node.closest === 'function'
          && node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
        const onKeyDown = (event) => {
          if (!activeRef.current) return;
          const target = event.target;
          const widget = rootRef.current && typeof rootRef.current.closest === 'function'
            ? rootRef.current.closest('.mg-root')
            : null;
          const inside = Boolean(widget && target && widget.contains(target));
          const onPage = !target || target === document.body || target === document.documentElement;
          if (!inside && !onPage) return;
          if (isEditable(target)) return;
          const key = event.key;
          if (pausedRef.current) return;
          const act = (fn) => setGame((current) => {
            const base = current.status === 'ready' ? { ...current, status: 'playing' } : current;
            return fn(base);
          });
          if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            event.preventDefault();
            act((current) => tetrisMove(current, -1));
            return;
          }
          if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            event.preventDefault();
            act((current) => tetrisMove(current, 1));
            return;
          }
          if (key === 'ArrowDown' || key === 's' || key === 'S') {
            event.preventDefault();
            act((current) => tetrisStep(current));
            return;
          }
          if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'x' || key === 'X') {
            event.preventDefault();
            act((current) => tetrisRotate(current));
            return;
          }
          if (key === 'Enter') {
            event.preventDefault();
            act((current) => tetrisHardDrop(current));
          }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
      }, []);

      const display = game.grid.map((row) => row.slice());
      game.piece.matrix.forEach((row, r) => {
        row.forEach((value, c) => {
          if (!value) return;
          const gy = game.piece.y + r;
          const gx = game.piece.x + c;
          if (gy >= 0 && gy < TETRIS_ROWS && gx >= 0 && gx < TETRIS_COLS) display[gy][gx] = game.piece.type;
        });
      });

      const cells = [];
      const shadeTop = [35, 37, 41];
      const shadeBottom = [35, 37, 41];
      for (let i = 0; i < TETRIS_ROWS * TETRIS_COLS; i += 1) {
        const row = Math.floor(i / TETRIS_COLS);
        const type = display[row][i % TETRIS_COLS];
        let tone;
        if (type) {
          const t = row / (TETRIS_ROWS - 1);
          const mix = shadeTop.map((value, k) => Math.round(value + (shadeBottom[k] - value) * t));
          tone = 'rgb(' + mix.join(',') + ')';
        }
        cells.push(h('div', {
          key: i,
          className: 'mg-tetris-cell' + (type ? ' mg-tetris-on' : ''),
          style: type ? { background: tone, boxShadow: '0 0 0 2px ' + tone } : undefined,
        }));
      }

      const seams = [];
      const cellW = '(100% - 45px) / 10';
      const cellH = '(100% - 95px) / 20';
      const toneAt = (row) => {
        const t = row / (TETRIS_ROWS - 1);
        return shadeTop.map((value, k) => value + (shadeBottom[k] - value) * t);
      };
      const seamTone = () => '#dfe7f0';
      for (let r = 0; r < TETRIS_ROWS; r += 1) {
        for (let c = 0; c < TETRIS_COLS; c += 1) {
          if (r < TETRIS_ROWS - 1 && c < TETRIS_COLS - 1) {
            let around = 0;
            if (display[r][c]) around += 1;
            if (display[r][c + 1]) around += 1;
            if (display[r + 1][c]) around += 1;
            if (display[r + 1][c + 1]) around += 1;
            if (around === 4) {
              seams.push(h('div', {
                key: 'sc' + r + '-' + c,
                className: 'mg-tetris-seam',
                style: {
                  left: `calc(${cellW} * ${c + 1} + ${c * 5}px - 2px)`,
                  top: `calc(${cellH} * ${r + 1} + ${r * 5}px - 2px)`,
                  width: '9px',
                  height: '9px',
                  background: seamTone(toneAt(r), toneAt(r + 1)),
                },
              }));
            }
          }
          if (!display[r][c]) continue;
          if (c < TETRIS_COLS - 1 && display[r][c + 1]) {
            seams.push(h('div', {
              key: 'sh' + r + '-' + c,
              className: 'mg-tetris-seam',
              style: {
                left: `calc(${cellW} * ${c + 1} + ${c * 5}px - 3px)`,
                top: `calc(${cellH} * ${r} + ${r * 5}px - 2px)`,
                width: '11px',
                height: `calc(${cellH} + 4px)`,
                background: seamTone(toneAt(r), toneAt(r)),
              },
            }));
          }
          if (r < TETRIS_ROWS - 1 && display[r + 1][c]) {
            seams.push(h('div', {
              key: 'sv' + r + '-' + c,
              className: 'mg-tetris-seam',
              style: {
                left: `calc(${cellW} * ${c} + ${c * 5}px - 2px)`,
                top: `calc(${cellH} * ${r + 1} + ${r * 5}px - 3px)`,
                width: `calc(${cellW} + 4px)`,
                height: '11px',
                background: seamTone(toneAt(r), toneAt(r + 1)),
              },
            }));
          }
        }
      }

      const nextMatrix = TETRIS_SHAPES[game.nextType];
      const nextCells = [];
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          const on = Boolean(nextMatrix[r] && nextMatrix[r][c]);
          nextCells.push(h('div', {
            key: r * 4 + c,
            className: 'mg-tetris-ncell' + (on ? ' mg-tetris-non' : ''),
          }));
        }
      }

      return h('div', { className: 'mg-tetris', ref: rootRef },
        h('div', { className: 'mg-tetris-hud' },
          h('div', { className: 'mg-hud-score' },
            h('span', { className: 'mg-hud-label' }, t('score')),
            h('span', { className: 'mg-hud-value' }, game.score),
          ),
          h('div', { className: 'mg-hud-right' },
            h('span', { className: 'mg-hud-best', title: t('best') },
              h(StarGlyph, { size: 12 }),
              h('span', null, best),
            ),
          ),
          h('div', { className: 'mg-tetris-meta' },
            h('span', null, t('linesLabel') + ' ' + game.lines),
            h('span', null, t('levelLabel') + ' ' + game.level),
          ),
          h('div', {
            className: 'mg-tetris-next', title: t('nextLabel'), 'aria-label': t('nextLabel'),
          }, nextCells),
        ),
        h('div', { className: 'mg-tetris-body' },
          h('div', { className: 'mg-tetris-board' }, h('div', { className: 'mg-tetris-grid' }, cells, seams)),
        ),
        game.status === 'ready'
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' }, t('startHint')),
            h('div', { className: 'mg-gomoku-over-meta' }, t('tetrisKeys')),
          )
          : null,
        game.status === 'over'
          ? h('div', { className: 'mg-gomoku-over' },
            h('div', { className: 'mg-gomoku-over-title' }, t('gameOver')),
            h('div', { className: 'mg-gomoku-over-actions' },
              h('button', {
                type: 'button', className: 'mg-mines-btn', onClick: () => setGame(tetrisNew()),
              }, t('restart')),
            ),
          )
          : null,
      );
    }

    const MATCH_N = 8;
    const MATCH_KINDS = 5;
    const MATCH_BEST_KEY = 'dsh-minigame-list.match.best';

    function readMatchBest() {
      try {
        const value = Number(window.localStorage.getItem(MATCH_BEST_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch (error) {
        return 0;
      }
    }

    function writeMatchBest(value) {
      try {
        window.localStorage.setItem(MATCH_BEST_KEY, String(value));
      } catch (error) {
        /* storage unavailable: the record then lasts for this page only */
      }
    }

    function matchRandom() {
      return Math.floor(Math.random() * MATCH_KINDS);
    }

    function matchNewGrid() {
      const grid = new Array(MATCH_N * MATCH_N).fill(0);
      for (let row = 0; row < MATCH_N; row += 1) {
        for (let col = 0; col < MATCH_N; col += 1) {
          let value = matchRandom();
          let guard = 0;
          while (guard < 40) {
            const horizontal = col >= 2
              && grid[row * MATCH_N + col - 1] === value
              && grid[row * MATCH_N + col - 2] === value;
            const vertical = row >= 2
              && grid[(row - 1) * MATCH_N + col] === value
              && grid[(row - 2) * MATCH_N + col] === value;
            if (!horizontal && !vertical) break;
            value = matchRandom();
            guard += 1;
          }
          grid[row * MATCH_N + col] = value;
        }
      }
      return grid;
    }

    function matchSwap(grid, a, b) {
      const next = grid.slice();
      const temp = next[a];
      next[a] = next[b];
      next[b] = temp;
      return next;
    }

    function matchFind(grid) {
      const found = new Set();
      for (let row = 0; row < MATCH_N; row += 1) {
        let run = 1;
        for (let col = 1; col <= MATCH_N; col += 1) {
          const current = col < MATCH_N ? grid[row * MATCH_N + col] : -1;
          const previous = grid[row * MATCH_N + col - 1];
          if (current >= 0 && current === previous) {
            run += 1;
          } else {
            if (run >= 3) for (let k = col - run; k < col; k += 1) found.add(row * MATCH_N + k);
            run = 1;
          }
        }
      }
      for (let col = 0; col < MATCH_N; col += 1) {
        let run = 1;
        for (let row = 1; row <= MATCH_N; row += 1) {
          const current = row < MATCH_N ? grid[row * MATCH_N + col] : -1;
          const previous = grid[(row - 1) * MATCH_N + col];
          if (current >= 0 && current === previous) {
            run += 1;
          } else {
            if (run >= 3) for (let k = row - run; k < row; k += 1) found.add(k * MATCH_N + col);
            run = 1;
          }
        }
      }
      return found;
    }

    function matchHasMove(grid) {
      for (let row = 0; row < MATCH_N; row += 1) {
        for (let col = 0; col < MATCH_N; col += 1) {
          const index = row * MATCH_N + col;
          if (col < MATCH_N - 1) {
            const right = index + 1;
            if (matchFind(matchSwap(grid, index, right)).size > 0) return [index, right];
          }
          if (row < MATCH_N - 1) {
            const down = index + MATCH_N;
            if (matchFind(matchSwap(grid, index, down)).size > 0) return [index, down];
          }
        }
      }
      return null;
    }

    function matchResolve(grid) {
      let current = grid.slice();
      let gained = 0;
      let cleared = 0;
      let combo = 1;
      for (let guard = 0; guard < 12; guard += 1) {
        const found = matchFind(current);
        if (found.size === 0) break;
        cleared += found.size;
        gained += found.size * 10 * combo;
        const next = current.slice();
        found.forEach((index) => { next[index] = -1; });
        for (let col = 0; col < MATCH_N; col += 1) {
          let write = MATCH_N - 1;
          for (let row = MATCH_N - 1; row >= 0; row -= 1) {
            const value = next[row * MATCH_N + col];
            if (value < 0) continue;
            next[write * MATCH_N + col] = value;
            write -= 1;
          }
          for (let row = write; row >= 0; row -= 1) next[row * MATCH_N + col] = matchRandom();
        }
        current = next;
        combo += 1;
      }
      return { grid: current, gained, cleared };
    }

    let matchSeq = 0;

    function matchTiles() {
      return matchNewGrid().map((value, index) => {
        matchSeq += 1;
        return {
          id: matchSeq,
          value,
          row: Math.floor(index / MATCH_N),
          col: index % MATCH_N,
        };
      });
    }

    function matchValues(tiles) {
      const grid = new Array(MATCH_N * MATCH_N).fill(-1);
      tiles.forEach((tile) => {
        if (tile.row >= 0 && tile.row < MATCH_N) grid[tile.row * MATCH_N + tile.col] = tile.value;
      });
      return grid;
    }

    function matchSleep(ms) {
      return new Promise((resolve) => { window.setTimeout(resolve, ms); });
    }

    function MatchGame(props) {
      const { t, paused, restartTick, extraTick } = props;
      const [tiles, setTiles] = useState(matchTiles);
      const [score, setScore] = useState(0);
      const [best, setBest] = useState(readMatchBest);
      const [selected, setSelected] = useState(null);
      const [hint, setHint] = useState(null);
      const pausedRef = useRef(paused);
      pausedRef.current = paused;
      const tilesRef = useRef(tiles);
      tilesRef.current = tiles;
      const busyRef = useRef(false);
      const runRef = useRef(0);
      const lastRestart = useRef(restartTick);
      const lastExtra = useRef(extraTick);
      const hintTimer = useRef(0);

      const restart = useCallback(() => {
        runRef.current += 1;
        busyRef.current = false;
        setTiles(matchTiles());
        setScore(0);
        setSelected(null);
        setHint(null);
      }, []);

      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        restart();
      }, [restartTick, restart]);

      useEffect(() => {
        if (extraTick === lastExtra.current) return;
        lastExtra.current = extraTick;
        if (pausedRef.current) return;
        const move = matchHasMove(matchValues(tilesRef.current));
        setHint(move);
        if (hintTimer.current) window.clearTimeout(hintTimer.current);
        hintTimer.current = window.setTimeout(() => setHint(null), 2000);
      }, [extraTick]);

      useEffect(() => {
        if (score > best) {
          setBest(score);
          writeMatchBest(score);
        }
      }, [score, best]);

      useEffect(() => () => {
        if (hintTimer.current) window.clearTimeout(hintTimer.current);
      }, []);

      const resolveLoop = async (startTiles, run) => {
        let current = startTiles;
        let gained = 0;
        let combo = 1;
        for (let guard = 0; guard < 10; guard += 1) {
          const found = matchFind(matchValues(current));
          if (found.size === 0) break;
          const popping = current.map((tile) => (found.has(tile.row * MATCH_N + tile.col)
            ? { ...tile, pop: true }
            : tile));
          setTiles(popping);
          await matchSleep(150);
          if (run !== runRef.current) return { tiles: current, gained };
          const remaining = popping.filter((tile) => !tile.pop);
          const next = [];
          for (let col = 0; col < MATCH_N; col += 1) {
            const columnTiles = remaining.filter((tile) => tile.col === col).sort((a, b) => b.row - a.row);
            let row = MATCH_N - 1;
            columnTiles.forEach((tile) => {
              next.push({
                ...tile, row, col, pop: false,
              });
              row -= 1;
            });
            const missing = row + 1;
            for (let k = 0; k < missing; k += 1) {
              matchSeq += 1;
              next.push({
                id: matchSeq,
                value: matchRandom(),
                col,
                row: k - missing,
                targetRow: k,
              });
            }
          }
          setTiles(next);
          await matchSleep(16);
          if (run !== runRef.current) return { tiles: current, gained };
          const settled = next.map((tile) => (tile.targetRow === undefined
            ? tile
            : { ...tile, row: tile.targetRow, targetRow: undefined }));
          setTiles(settled);
          await matchSleep(190);
          if (run !== runRef.current) return { tiles: current, gained };
          current = settled;
          gained += found.size * 10 * combo;
          combo += 1;
        }
        return { tiles: current, gained };
      };

      const click = async (tile) => {
        if (pausedRef.current || busyRef.current) return;
        if (!selected) {
          setSelected(tile.id);
          return;
        }
        if (selected === tile.id) {
          setSelected(null);
          return;
        }
        const first = tilesRef.current.find((item) => item.id === selected);
        if (!first) {
          setSelected(tile.id);
          return;
        }
        const distance = Math.abs(first.row - tile.row) + Math.abs(first.col - tile.col);
        if (distance !== 1) {
          setSelected(tile.id);
          return;
        }
        busyRef.current = true;
        setSelected(null);
        setHint(null);
        const before = tilesRef.current;
        const swapped = before.map((item) => {
          if (item.id === first.id) return { ...item, row: tile.row, col: tile.col };
          if (item.id === tile.id) return { ...item, row: first.row, col: first.col };
          return item;
        });
        setTiles(swapped);
        await matchSleep(150);
        if (!matchFind(matchValues(swapped)).size) {
          setTiles(before);
          await matchSleep(150);
          busyRef.current = false;
          return;
        }
        const run = runRef.current;
        const result = await resolveLoop(swapped, run);
        if (run !== runRef.current) return;
        if (result.gained > 0) setScore((value) => value + result.gained);
        if (!matchHasMove(matchValues(result.tiles))) {
          setTiles(matchTiles());
        }
        busyRef.current = false;
      };

      const cells = [];
      for (let i = 0; i < MATCH_N * MATCH_N; i += 1) {
        cells.push(h('div', {
          key: i,
          className: 'mg-match-cell',
          style: {
            left: ((i % MATCH_N) * 12.5 + 0.55) + '%',
            top: (Math.floor(i / MATCH_N) * 12.5 + 0.55) + '%',
          },
        }));
      }

      const tileViews = tiles.map((tile) => {
        const isHint = hint && tile.row >= 0
          && (tile.row * MATCH_N + tile.col === hint[0] || tile.row * MATCH_N + tile.col === hint[1]);
        return h('button', {
          key: tile.id,
          type: 'button',
          className: 'mg-match-tile mg-match-v' + tile.value
            + (tile.pop ? ' mg-match-pop' : '')
            + (selected === tile.id ? ' mg-match-sel' : '')
            + (isHint ? ' mg-match-hint' : ''),
          style: {
            left: (tile.col * 12.5 + 0.55) + '%',
            top: (tile.row * 12.5 + 0.55) + '%',
          },
          'aria-label': String(tile.value + 1),
          onClick: () => click(tile),
        });
      });

      return h('div', { className: 'mg-match' },
        h('div', { className: 'mg-match-hud' },
          h('div', { className: 'mg-hud-score' },
            h('span', { className: 'mg-hud-label' }, t('score')),
            h('span', { className: 'mg-hud-value' }, score),
          ),
          h('div', { className: 'mg-hud-right' },
            h('span', { className: 'mg-hud-best', title: t('best') },
              h(StarGlyph, { size: 12 }),
              h('span', null, best),
            ),
          ),
        ),
        h('div', { className: 'mg-match-body' },
          h('div', { className: 'mg-match-board' },
            h('div', { className: 'mg-match-grid' }, cells, tileViews),
          ),
        ),
      );
    }

    const BREAKOUT_W = 480;
    const BREAKOUT_H = 320;
    const BREAKOUT_LIVES = 3;
    const BREAKOUT_HEART_PATH = 'M7.2 7.2 L12 12 L16.8 7.2 L21.6 12 L16.8 16.8 L12 21.6 L7.2 16.8 L2.4 12 Z';

    function breakoutLayout(level) {
      const rows = Math.min(3 + Math.max(0, level - 1), 6);
      const cols = 8;
      const pad = 14;
      const gap = 6;
      const top = 34;
      const brickH = 16;
      const brickW = (BREAKOUT_W - pad * 2 - gap * (cols - 1)) / cols;
      const bricks = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          bricks.push({
            x: pad + col * (brickW + gap),
            y: top + row * (brickH + gap),
            w: brickW,
            h: brickH,
            row,
            col,
            alive: true,
          });
        }
      }
      return bricks;
    }

    function breakoutRoundRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    function breakoutResetBall(game) {
      game.ball.x = game.paddle.x + game.paddle.w / 2;
      game.ball.y = game.paddle.y - game.ball.r - 2;
      game.ball.vx = 0;
      game.ball.vy = 0;
    }

    function breakoutUpdate(game, dt) {
      game.anim += dt;
      const paddle = game.paddle;
      if (game.keys.left) paddle.x -= 420 * dt;
      if (game.keys.right) paddle.x += 420 * dt;
      paddle.x = Math.max(0, Math.min(BREAKOUT_W - paddle.w, paddle.x));

      if (game.status === 'lostlife') {
        if (game.anim >= 0.7) {
          if (game.lives <= 0) {
            game.status = 'over';
          } else {
            game.status = 'ready';
            breakoutResetBall(game);
          }
          game.anim = 0;
          game.dirty = true;
        }
        return;
      }

      if (game.status === 'levelup') {
        game.ball.y += game.ball.vy * dt;
        if (game.anim >= 0.55) {
          game.level += 1;
          game.bricks = breakoutLayout(game.level);
          game.speed = 240 + game.level * 22;
          game.status = 'ready';
          game.anim = 0;
          breakoutResetBall(game);
          game.dirty = true;
        }
        return;
      }

      if (game.status === 'ready') {
        breakoutResetBall(game);
        return;
      }

      if (game.status !== 'playing') return;

      const ball = game.ball;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + ball.r > BREAKOUT_W) {
        ball.x = BREAKOUT_W - ball.r;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - ball.r < 0) {
        game.status = 'levelup';
        game.anim = 0;
        game.dirty = true;
        return;
      }
      if (ball.y - ball.r > BREAKOUT_H) {
        game.lives -= 1;
        game.status = 'lostlife';
        game.anim = 0;
        game.ball.vx = 0;
        game.ball.vy = 0;
        game.dirty = true;
        return;
      }

      if (ball.vy > 0
        && ball.y + ball.r >= paddle.y
        && ball.y - ball.r <= paddle.y + paddle.h
        && ball.x >= paddle.x - ball.r
        && ball.x <= paddle.x + paddle.w + ball.r) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speed = Math.min(620, Math.hypot(ball.vx, ball.vy) * 1.02);
        const angle = (-Math.PI / 2) + hit * 0.9;
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
        ball.y = paddle.y - ball.r - 0.5;
        return;
      }

      for (let i = 0; i < game.bricks.length; i += 1) {
        const brick = game.bricks[i];
        if (!brick.alive) continue;
        const nearX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
        const nearY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
        const dx = ball.x - nearX;
        const dy = ball.y - nearY;
        if (dx * dx + dy * dy > ball.r * ball.r) continue;
        brick.alive = false;
        game.score += 50;
        game.dirty = true;
        const overlapX = (brick.w / 2 + ball.r) - Math.abs(ball.x - (brick.x + brick.w / 2));
        const overlapY = (brick.h / 2 + ball.r) - Math.abs(ball.y - (brick.y + brick.h / 2));
        if (overlapX < overlapY) ball.vx = -ball.vx;
        else ball.vy = -ball.vy;
        break;
      }
    }

    function breakoutDraw(ctx, game, scale) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, BREAKOUT_W, BREAKOUT_H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, BREAKOUT_W, BREAKOUT_H);

      const entrance = game.status === 'ready';
      game.bricks.forEach((brick) => {
        if (!brick.alive) return;
        let progress = 1;
        if (entrance) {
          const delay = 0.05 + (brick.row * 8 + brick.col) * 0.012;
          progress = Math.min(1, Math.max(0, (game.anim - delay) / 0.28));
          if (progress <= 0) return;
        }
        ctx.save();
        ctx.globalAlpha = progress;
        const cx = brick.x + brick.w / 2;
        const cy = brick.y + brick.h / 2;
        const grow = 0.4 + 0.6 * progress;
        ctx.translate(cx, cy - (1 - progress) * 8);
        ctx.scale(grow, grow);
        ctx.fillStyle = '#000000';
        breakoutRoundRect(ctx, -brick.w / 2, -brick.h / 2, brick.w, brick.h, 4);
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#1f2328';
      breakoutRoundRect(ctx, game.paddle.x, game.paddle.y, game.paddle.w, game.paddle.h, game.paddle.h / 2);
      ctx.fill();

      if (game.status !== 'lostlife') {
        let radius = game.ball.r;
        if (game.status === 'ready') {
          const t = Math.min(1, Math.max(0, (game.anim - 0.3) / 0.3));
          if (t <= 0) return;
          radius *= 0.3 + 0.7 * t;
        }
        ctx.beginPath();
        ctx.arc(game.ball.x, game.ball.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (game.status === 'lostlife') {
        const alpha = Math.max(0, 1 - game.anim / 0.7) * 0.32;
        ctx.fillStyle = 'rgba(220, 38, 38, ' + alpha.toFixed(3) + ')';
        ctx.fillRect(0, 0, BREAKOUT_W, BREAKOUT_H);
      }
    }

    function BreakoutGame(props) {
      const {
        t, paused, active, restartTick, extraTick,
      } = props;
      const canvasRef = useRef(null);
      const [hud, setHud] = useState({
        score: 0, lives: BREAKOUT_LIVES, level: 1, status: 'ready',
      });
      const [tipOn, setTipOn] = useState(false);
      const [lostPulse, setLostPulse] = useState(0);
      const hudRef = useRef(hud);
      hudRef.current = hud;
      const tipRef = useRef(false);
      const pausedRef = useRef(paused);
      pausedRef.current = paused;
      const activeRef = useRef(active);
      activeRef.current = active;
      const lastRestart = useRef(restartTick);
      const lastExtra = useRef(extraTick);
      const gameRef = useRef(null);

      const build = (level, score, lives) => {
        const paddle = {
          x: (BREAKOUT_W - 72) / 2, w: 72, h: 10, y: BREAKOUT_H - 22,
        };
        gameRef.current = {
          level,
          score,
          lives,
          status: 'ready',
          anim: 0,
          paddle,
          ball: {
            x: paddle.x + paddle.w / 2, y: paddle.y - 8, vx: 0, vy: 0, r: 6,
          },
          bricks: breakoutLayout(level),
          speed: 240 + level * 22,
          keys: { left: false, right: false },
          dirty: false,
        };
        setHud({
          score, lives, level, status: 'ready',
        });
        setTipOn(false);
        tipRef.current = false;
      };

      const serve = () => {
        const game = gameRef.current;
        if (!game || game.status !== 'ready' || pausedRef.current) return;
        if (game.anim < 0.45) return;
        game.status = 'playing';
        const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.7;
        game.ball.vx = Math.cos(angle) * game.speed;
        game.ball.vy = Math.sin(angle) * game.speed;
        game.dirty = true;
      };
      const serveRef = useRef(serve);
      serveRef.current = serve;

      useEffect(() => {
        build(1, 0, BREAKOUT_LIVES);
      }, []);

      useEffect(() => {
        if (restartTick === lastRestart.current) return;
        lastRestart.current = restartTick;
        build(1, 0, BREAKOUT_LIVES);
      }, [restartTick]);

      useEffect(() => {
        if (extraTick === lastExtra.current) return;
        lastExtra.current = extraTick;
        serveRef.current();
      }, [extraTick]);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = BREAKOUT_W * dpr;
        canvas.height = BREAKOUT_H * dpr;
        let raf = 0;
        let last = performance.now();
        const step = (now) => {
          raf = window.requestAnimationFrame(step);
          const raw = (now - last) / 1000;
          last = now;
          const dt = Math.min(raw, 0.05);
          const game = gameRef.current;
          if (!game) return;
          if (!pausedRef.current && activeRef.current) {
            breakoutUpdate(game, dt);
          }
          if (game.dirty) {
            game.dirty = false;
            const previousLives = hudRef.current.lives;
            setHud({
              score: game.score, lives: game.lives, level: game.level, status: game.status,
            });
            if (game.lives < previousLives) setLostPulse((value) => value + 1);
          }
          const showTip = game.status === 'ready' && game.anim > 0.5;
          if (showTip !== tipRef.current) {
            tipRef.current = showTip;
            setTipOn(showTip);
          }
          breakoutDraw(ctx, game, dpr);
        };
        raf = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(raf);
      }, []);

      useEffect(() => {
        const isEditable = (node) => Boolean(node && typeof node.closest === 'function'
          && node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
        const onKeyDown = (event) => {
          if (!activeRef.current) return;
          const game = gameRef.current;
          if (!game) return;
          const target = event.target;
          const widget = canvasRef.current && typeof canvasRef.current.closest === 'function'
            ? canvasRef.current.closest('.mg-root')
            : null;
          const inside = Boolean(widget && target && widget.contains(target));
          const onPage = !target || target === document.body || target === document.documentElement;
          if (!inside && !onPage) return;
          if (isEditable(target)) return;
          if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            event.preventDefault();
            game.keys.left = true;
            return;
          }
          if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
            event.preventDefault();
            game.keys.right = true;
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            serveRef.current();
          }
        };
        const onKeyUp = (event) => {
          const game = gameRef.current;
          if (!game) return;
          if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') game.keys.left = false;
          if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') game.keys.right = false;
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        return () => {
          document.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('keyup', onKeyUp);
        };
      }, []);

      useEffect(() => {
        const movePaddle = (event) => {
          const game = gameRef.current;
          const canvas = canvasRef.current;
          if (!game || !canvas) return;
          const rect = canvas.getBoundingClientRect();
          if (rect.width <= 0) return;
          const x = ((event.clientX - rect.left) / rect.width) * BREAKOUT_W;
          game.paddle.x = Math.max(0, Math.min(BREAKOUT_W - game.paddle.w, x - game.paddle.w / 2));
        };
        window.addEventListener('pointermove', movePaddle);
        return () => window.removeEventListener('pointermove', movePaddle);
      }, []);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const onDown = () => serveRef.current();
        canvas.addEventListener('pointerdown', onDown);
        return () => canvas.removeEventListener('pointerdown', onDown);
      }, []);

      useEffect(() => {
        const game = gameRef.current;
        if (game && paused) {
          game.keys.left = false;
          game.keys.right = false;
        }
      }, [paused]);

      const hearts = [];
      for (let i = 0; i < BREAKOUT_LIVES; i += 1) {
        const alive = i < hud.lives;
        hearts.push(h('svg', {
          key: i,
          viewBox: '1.5 6.5 21 16',
          className: 'mg-heart',
          'data-lost': alive ? 'false' : 'true',
          'aria-hidden': 'true',
        }, h('path', { d: BREAKOUT_HEART_PATH })));
      }

      return h('div', { className: 'mg-breakout' },
        h('div', { className: 'mg-breakout-hud' },
          h('div', { className: 'mg-hud-score' },
            h('span', { className: 'mg-hud-label' }, t('score')),
            h('span', { className: 'mg-hud-value' }, hud.score),
          ),
          h('div', { className: 'mg-breakout-meta' },
            h('span', null, t('levelLabel') + ' ' + hud.level),
            h('span', { className: 'mg-breakout-hearts' },
              hearts,
              lostPulse > 0
                ? h('svg', {
                  key: lostPulse,
                  viewBox: '1.5 6.5 21 16',
                  className: 'mg-breakout-lostheart',
                  style: { left: (hud.lives * 20) + 'px' },
                  'aria-hidden': 'true',
                }, h('path', { d: BREAKOUT_HEART_PATH }))
                : null,
            ),
          ),
        ),
        h('div', { className: 'mg-breakout-body' },
          h('canvas', { ref: canvasRef, className: 'mg-breakout-canvas' }),
          tipOn
            ? h('div', { className: 'mg-breakout-tip' }, t('breakoutServe'))
            : null,
          hud.status === 'over'
            ? h('div', { className: 'mg-gomoku-over' },
              h('div', { className: 'mg-gomoku-over-title' }, t('gameOver')),
              h('div', { className: 'mg-gomoku-over-actions' },
                h('button', {
                  type: 'button', className: 'mg-mines-btn', onClick: () => build(1, 0, BREAKOUT_LIVES),
                }, t('restart')),
              ),
            )
            : null,
        ),
      );
    }

    /* One shared line-icon grammar: 24px grid, 1.8px stroke, round joins, so the
     * shelf, the stage and the console read as one set with the launcher glyph. */
    function Glyph(props) {
      const size = props.size || 18;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round',
        strokeLinejoin: 'round', 'aria-hidden': true, focusable: false,
      }, props.children);
    }

    function SnakeIcon(props) {
      return h(Glyph, { size: props.size },
        h('path', { d: 'M5.2 17.6c0-2.4 1.9-3.7 4.3-3.7h5.5c2.2 0 3.9-1.5 3.9-3.6 0-2.1-1.7-3.5-3.9-3.5H9.6' }),
        h('circle', { cx: 5.2, cy: 17.6, r: 1.5, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function TilesIcon(props) {
      return h(Glyph, { size: props.size },
        h('rect', { x: 3.8, y: 3.8, width: 7.2, height: 7.2, rx: 2 }),
        h('rect', { x: 13, y: 3.8, width: 7.2, height: 7.2, rx: 2 }),
        h('rect', { x: 3.8, y: 13, width: 7.2, height: 7.2, rx: 2 }),
        h('rect', { x: 13, y: 13, width: 7.2, height: 7.2, rx: 2, fill: 'currentColor', fillOpacity: 0.22 }),
      );
    }

    function BlocksIcon(props) {
      return h(Glyph, { size: props.size },
        h('rect', { x: 4, y: 4, width: 5.6, height: 5.6, rx: 1.5 }),
        h('rect', { x: 9.6, y: 4, width: 5.6, height: 5.6, rx: 1.5 }),
        h('rect', { x: 15.2, y: 4, width: 5.6, height: 5.6, rx: 1.5 }),
        h('rect', { x: 9.6, y: 9.6, width: 5.6, height: 5.6, rx: 1.5 }),
      );
    }

    function MineIcon(props) {
      return h(Glyph, { size: props.size },
        h('circle', { cx: 12, cy: 12, r: 5.2 }),
        h('path', { d: 'M12 3v3.8M12 17.2V21M3 12h3.8M17.2 12H21M5.6 5.6l2.5 2.5M18.4 5.6l-2.5 2.5M5.6 18.4l2.5-2.5M18.4 18.4l-2.5-2.5' }),
        h('circle', { cx: 10, cy: 10, r: 1.1, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function MatchIcon(props) {
      return h(Glyph, { size: props.size },
        h('circle', { cx: 6, cy: 15.4, r: 2.6 }),
        h('circle', { cx: 12, cy: 8.4, r: 2.6 }),
        h('circle', { cx: 18, cy: 15.4, r: 2.6 }),
        h('circle', { cx: 12, cy: 15.4, r: 2.6, fill: 'currentColor', fillOpacity: 0.22 }),
      );
    }

    function BreakoutIcon(props) {
      return h(Glyph, { size: props.size },
        h('path', { d: 'M4 6h4.4M10 6h4M15.6 6h4.4' }),
        h('circle', { cx: 12, cy: 12.6, r: 1.5, fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M7.6 18.6h8.8' }),
      );
    }

    function GamepadGlyph(props) {
      return h('svg', {
        width: props.size || 22, height: props.size || 22, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round',
        strokeLinejoin: 'round', 'aria-hidden': true, focusable: false,
      },
        h('rect', { x: 2.5, y: 8, width: 19, height: 9.5, rx: 4.5 }),
        h('path', { d: 'M7 10.9v3.6M5.2 12.7h3.6' }),
        h('circle', { cx: 16.2, cy: 11.6, r: 0.9, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 18.4, cy: 14.2, r: 0.9, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function CloseGlyph(props) {
      return h('svg', {
        width: props.size || 18, height: props.size || 18, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
        'aria-hidden': true, focusable: false,
      },
        h('path', { d: 'M6 6l12 12M18 6L6 18' }),
      );
    }

    function BackGlyph() {
      return h(Glyph, { size: 18 },
        h('path', { d: 'M19.5 12H4.5' }),
        h('path', { d: 'M10.5 5.5L4 12l6.5 6.5' }),
      );
    }

    function PauseGlyph(props) {
      return h('svg', {
        width: props.size || 18, height: props.size || 18, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
        'aria-hidden': true, focusable: false,
      },
        h('path', { d: 'M9.5 6v12M14.5 6v12' }),
      );
    }

    function PlayGlyph(props) {
      return h(Glyph, { size: props.size },
        h('path', { d: 'M8.5 5.5l9.5 6.5-9.5 6.5z' }),
      );
    }

    function RestartGlyph(props) {
      return h(Glyph, { size: props.size || 17 },
        h('path', { d: 'M20 12a8 8 0 1 1-2.4-5.7' }),
        h('path', { d: 'M20 4.5V9h-4.5' }),
      );
    }

    function FlagGlyph(props) {
      return h(Glyph, { size: props.size || 12 },
        h('path', { d: 'M6.5 20V4.5' }),
        h('path', { d: 'M6.5 5h10l-2.2 3 2.2 3h-10' }),
      );
    }

    function GomokuIcon(props) {
      return h(Glyph, { size: props.size },
        h('rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 2.5 }),
        h('path', { d: 'M3.5 9h17M3.5 15h17M9 3.5v17M15 3.5v17' }),
        h('circle', { cx: 9, cy: 9, r: 2.1, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function XiangqiIcon(props) {
      return h(Glyph, { size: props.size },
        h('rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 3 }),
        h('circle', { cx: 12, cy: 12, r: 4.2 }),
        h('path', { d: 'M12 10.2v3.6M10.2 12h3.6' }),
      );
    }

    function GoIcon(props) {
      return h(Glyph, { size: props.size },
        h('path', { d: 'M3.5 8h17M3.5 12h17M3.5 16h17M8 3.5v17M12 3.5v17M16 3.5v17' }),
        h('circle', { cx: 8, cy: 8, r: 1.9, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 16, cy: 16, r: 1.9 }),
      );
    }

    function StarGlyph(props) {
      return h(Glyph, { size: props.size || 12 },
        h('path', { d: 'M12 4.6l2.1 4.4 4.8.7-3.5 3.4.8 4.8-4.2-2.3-4.2 2.3.8-4.8L5.1 9.7l4.8-.7z' }),
      );
    }

    /* One compact status signature for the whole session set: "running|pending".
     * Primitive so the status store only re-renders on a real change. */
    function sessionSignal(state) {
      if (!state) return 'false|';
      let running = false;
      let pending = '';
      const visit = (node) => {
        if (!node) return;
        if (node.pendingInteraction && !pending) pending = node.pendingInteraction;
        if (node.running) running = true;
      };
      if (typeof state.forEach === 'function') {
        state.forEach(visit);
      } else if (typeof state === 'object') {
        Object.keys(state).forEach((key) => visit(state[key]));
      }
      return (running ? 'true' : 'false') + '|' + pending;
    }

    /* Stable no-op used only when the slot does not supply the status hook. */
    function useNoStatus() {
      return 'false|';
    }

    const REASON_KEY = {
      manual: 'reasonManual',
      done: 'reasonDone',
      approval: 'reasonApproval',
      'plan-review': 'reasonPlan',
      question: 'reasonQuestion',
      hidden: 'reasonHidden',
    };

    function gameFrame(game) {
      return game ? { w: game.w, h: game.h } : MENU;
    }

    function GameStage(props) {
      const {
        t, game, active, extraTick, restartTick, running, pending, paused, pauseReason, boost, note, onFrame, onTogglePause,
      } = props;

      let tone = 'idle';
      let stateText = t('stateIdle');
      if (pending) {
        tone = 'warn';
        stateText = t(pending === 'plan-review' ? 'statePlan' : pending === 'question' ? 'stateQuestion' : 'stateApproval');
      } else if (running) {
        tone = 'live';
        stateText = t('waiting');
      } else if (paused && pauseReason === 'done') {
        tone = 'done';
        stateText = t('stateDone');
      }
      const autoPaused = paused
        && (pauseReason === 'done' || pauseReason === 'approval'
          || pauseReason === 'plan-review' || pauseReason === 'question');

      return h(React.Fragment, null,
        h('div', { className: 'mg-gamebar' },
          h('span', { className: 'mg-gamebar-state' },
            h('span', { className: 'mg-state-dot', 'data-tone': tone, 'aria-hidden': 'true' }),
            h('span', null, stateText),
          ),
          paused
            ? h('span', {
              className: 'mg-gamebar-pill',
              'data-auto': autoPaused ? 'true' : 'false',
            }, t('paused'))
            : null,
        ),
        h('div', { className: 'mg-stage' },
          game.Game ? null : h('div', { className: 'mg-stage-grid', 'aria-hidden': 'true' }),
          game.Game
            ? h(game.Game, {
              t, active, extraTick, restartTick, paused, boost, onFrame, onTogglePause,
            })
            : h('div', { className: 'mg-stage-center' },
              h('span', { className: 'mg-stage-icon' }, h(game.Icon, { size: 40 })),
              h('div', { className: 'mg-stage-title' }, t(game.id)),
              h('div', { className: 'mg-stage-hint' }, t('placeholder')),
            ),
          paused
            ? h('div', { className: 'mg-pause' },
              h('span', { className: 'mg-pause-icon' }, h(PauseGlyph, { size: 20 })),
              h('div', { className: 'mg-pause-title' }, t('paused')),
              h('div', { className: 'mg-pause-reason' }, t(REASON_KEY[pauseReason] || 'reasonManual')),
              h('div', { className: 'mg-pause-hint' }, t('resumeHint')),
            )
            : null,
          note ? h('div', { className: 'mg-note', role: 'status' }, note) : null,
        ),
      );
    }

    const THEME_KEY = 'dsh-minigame-list.theme';
    const THEME_PRESETS = ['#0f1115', '#1e3a5f', '#14532d', '#7f1d1d', '#4c1d95', '#9a3412', '#155e75', '#334155'];
    const GRADIENT_PRESETS = [['#0f1115', '#14532d'], ['#1e3a5f', '#0e7490'], ['#4c1d95', '#be185d'], ['#7f1d1d', '#b45309']];
    const THEME_TEXTURES = ['none', 'dots', 'contour', 'grid'];
    const TEX_KEYS = {
      none: 'texNone', dots: 'texDots', contour: 'texContour', grid: 'texGrid',
    };
    const THEME_DEFAULTS = {
      theme: '#0f1115', gradient: true, advanced: false, solid: false, from: '#0f1115', to: '#14532d', end: '#363c44', texture: 'none', texColor: '#ffffff',
    };

    function mgThemeRead() {
      try {
        const raw = JSON.parse(window.localStorage.getItem(THEME_KEY));
        return raw && typeof raw === 'object' ? Object.assign({}, THEME_DEFAULTS, raw) : Object.assign({}, THEME_DEFAULTS);
      } catch (error) {
        return Object.assign({}, THEME_DEFAULTS);
      }
    }

    function mgThemeWrite(value) {
      try {
        window.localStorage.setItem(THEME_KEY, JSON.stringify(value));
      } catch (error) {
        /* storage unavailable */
      }
    }

    function mgHexParts(hex) {
      const raw = String(hex).replace('#', '');
      const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
      if (full.length !== 6) return [15, 17, 21];
      return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    }

    function mgLum(hex) {
      const [r, g, b] = mgHexParts(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function mgOnColor(hex) {
      return mgLum(hex) > 0.42 ? '#0b0d10' : '#ffffff';
    }

    function mgDarken(hex, factor) {
      const parts = mgHexParts(hex).map((v) => Math.round(Math.min(255, v * factor)));
      return 'rgb(' + parts.join(',') + ')';
    }

    function SettingsGlyph(props) {
      const size = props.size || 14;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round',
        'aria-hidden': true, focusable: false,
      },
        h('path', { d: 'M3 6.5h18M3 12h18M3 17.5h18' }),
        h('circle', { cx: 8, cy: 6.5, r: 2.1, fill: '#ffffff' }),
        h('circle', { cx: 16, cy: 12, r: 2.1, fill: '#ffffff' }),
        h('circle', { cx: 10, cy: 17.5, r: 2.1, fill: '#ffffff' }),
      );
    }

    function CheckGlyph(props) {
      const size = props.size || 12;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      }, h('path', { d: 'M5 12.5l4.5 4.5L19 7.5' }));
    }

    /* A switch is a button, not a checkbox: the settings sheet keeps one
     * control shape and the state is announced through aria-checked. */
    function MgSwitch(props) {
      return h('button', {
        type: 'button',
        role: 'switch',
        className: 'mg-toggle',
        'aria-checked': props.checked ? 'true' : 'false',
        'aria-label': props.label,
        onClick: () => props.onChange(!props.checked),
      });
    }

    function mgSectionHead(num, label, value) {
      return h('div', { className: 'mg-set-sec-head' },
        h('span', { className: 'mg-set-num' }, num),
        h('span', { className: 'mg-set-dot', 'aria-hidden': 'true' }),
        h('h3', { className: 'mg-set-label' }, label),
        h('span', { className: 'mg-set-rule' }),
        value ? h('span', { className: 'mg-set-val' }, value) : null,
      );
    }

    const MG_CONTOUR = "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20638%20321%27%3E%3Cpath%20fill%3D%27none%27%20stroke%3D%27%23000%27%20stroke-width%3D%271.6%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%20d%3D%27M180%2070%20L178%2072%20L181%2076%20L185%2072%20L181%2070Z%20M609%20250%20L606%20252%20L609%20261%20L607%20271%20L619%20285%20L620%20282%20L615%20275%20L615%20255%20L609%20250Z%20M136%20-15%20L152%20-2%20L155%20-5%20L153%20-15Z%20M541%2010%20L536%2014%20L539%2016%20L544%2012%20L542%2010Z%20M521%2025%20L518%2032%20L521%2031%20L522%2026Z%20M176%2066%20L174%2070%20L176%2076%20L184%2079%20L187%2076%20L187%2071%20L184%2067%20L178%2066Z%20M298%20205%20L296%20209%20L299%20213%20L302%20210%20L299%20205Z%20M600%20243%20L605%20261%20L605%20273%20L619%20290%20L624%20289%20L625%20285%20L620%20272%20L620%20258%20L615%20249%20L601%20243Z%20M-4%20296%20L-5%20300%20L1%20302%20L3%20298%20L-2%20295Z%20M132%20-15%20L142%20-2%20L154%204%20L157%202%20L159%20-4%20L155%20-15Z%20M539%206%20L525%2014%20L515%2024%20L509%2038%20L512%2042%20L524%2038%20L531%2022%20L546%2020%20L548%209%20L540%206Z%20M154%2026%20L154%2032%20L160%2034%20L161%2030%20L155%2026Z%20M170%2043%20L169%2050%20L172%2056%20L175%2049%20L171%2044Z%20M172%2059%20L170%2065%20L173%2075%20L176%2080%20L181%2082%20L188%2079%20L190%2071%20L185%2065%20L174%2059Z%20M-4%20102%20L-10%20111%20L-6%20114%20L0%20112%20L4%20109%20L4%20105%20L1%20102%20L-2%20102Z%20M152%20105%20L151%20108%20L158%20114%20L162%20112%20L164%20109%20L154%20105Z%20M605%20111%20L600%20114%20L598%20118%20L606%20119%20L611%20116%20L612%20112%20L606%20111Z%20M366%20141%20L362%20145%20L363%20149%20L378%20156%20L379%20152%20L376%20145%20L372%20141%20L368%20140Z%20M296%20198%20L293%20202%20L293%20211%20L295%20215%20L300%20217%20L304%20215%20L306%20210%20L302%20203%20L298%20198Z%20M319%20219%20L315%20222%20L318%20225%20L322%20224%20L320%20219Z%20M590%20234%20L586%20238%20L597%20249%20L602%20262%20L604%20275%20L615%20291%20L624%20294%20L627%20291%20L628%20284%20L622%20255%20L616%20247%20L591%20234Z%20M-4%20290%20L-12%20295%20L-13%20302%20L1%20312%20L4%20310%20L8%20298%20L5%20293%20L-2%20290Z%20M379%20304%20L376%20306%20L379%20307%20L382%20304%20L380%20303Z%20M129%20-15%20L137%202%20L154%209%20L158%208%20L160%201%20L161%20-6%20L158%20-15Z%20M633%20-15%20L632%20-10%20L638%20-7%20L644%20-11%20L639%20-15Z%20M-15%2079%20L-5%2077%20L1%2080%20L2%2085%20L-2%2089%20L-4%2095%20L5%2098%20L8%20106%20L7%20111%20L-2%20119%20L-6%20126%20L-15%20113Z%20M-15%20292%20L-1%20286%20L8%20291%20L11%20299%20L5%20315%20L-8%20313%20L-15%20318Z%20M536%204%20L526%207%20L510%2024%20L504%2040%20L507%2046%20L511%2048%20L527%2042%20L534%2026%20L539%2026%20L544%2030%20L549%2027%20L551%2015%20L550%208%20L545%204%20L538%204Z%20M151%2021%20L149%2030%20L163%2050%20L162%2064%20L176%2085%20L186%2083%20L191%2078%20L192%2071%20L180%2058%20L179%2044%20L166%2028%20L152%2021Z%20M18%2085%20L13%2090%20L15%2093%20L20%2093%20L24%2086%20L19%2084Z%20M635%2096%20L630%20100%20L632%20109%20L646%20120%20L650%20119%20L651%20114%20L644%20108%20L636%2096Z%20M151%2098%20L148%20101%20L146%20109%20L154%20117%20L158%20119%20L166%20114%20L168%20106%20L163%20100%20L152%2098Z%20M610%20106%20L598%20111%20L592%20118%20L595%20123%20L606%20123%20L614%20120%20L618%20112%20L618%20108%20L611%20106Z%20M252%20131%20L247%20144%20L250%20148%20L255%20148%20L261%20146%20L262%20142%20L260%20135%20L254%20131Z%20M366%20137%20L359%20142%20L359%20150%20L373%20159%20L379%20159%20L383%20155%20L383%20150%20L375%20140%20L368%20137Z%20M535%20139%20L522%20156%20L522%20161%20L535%20154%20L541%20148%20L543%20140%20L536%20138Z%20M-8%20146%20L-12%20150%20L-9%20153%20L-2%20150%20L-6%20146Z%20M396%20147%20L395%20150%20L396%20151%20L398%20150%20L397%20148Z%20M465%20182%20L460%20190%20L464%20193%20L468%20193%20L471%20185%20L470%20182%20L466%20182Z%20M294%20194%20L290%20202%20L291%20214%20L295%20219%20L305%20222%20L310%20229%20L313%20244%20L315%20244%20L326%20229%20L326%20220%20L320%20214%20L311%20213%20L303%20199%20L295%20194Z%20M176%20212%20L176%20219%20L180%20221%20L181%20216%20L178%20212Z%20M590%20229%20L583%20235%20L582%20240%20L594%20249%20L603%20278%20L620%20299%20L622%20308%20L628%20308%20L632%20304%20L634%20298%20L626%20255%20L622%20249%20L596%20229%20L591%20228Z%20M384%20294%20L375%20297%20L365%20297%20L361%20300%20L364%20307%20L378%20313%20L395%20305%20L398%20301%20L395%20296%20L385%20293Z%20M124%20-15%20L128%20-10%20L133%205%20L146%209%20L151%2014%20L146%2029%20L158%2050%20L156%2065%20L168%2076%20L172%2090%20L175%2091%20L189%2084%20L194%2078%20L194%2071%20L192%2065%20L185%2058%20L184%2049%20L179%2039%20L157%2016%20L163%20-4%20L161%20-15Z%20M622%20-15%20L635%20-2%20L647%20-8%20L648%20-15Z%20M-15%2076%20L-2%2074%20L11%2081%20L24%2081%20L27%2086%20L22%2095%20L12%20100%20L10%20111%20L0%20122%20L-3%20138%20L2%20146%20L2%20152%20L-15%20163Z%20M654%20109%20L646%20104%20L640%2092%20L635%2091%20L626%2095%20L621%20101%20L611%20101%20L595%20109%20L589%20120%20L590%20124%20L595%20126%20L615%20126%20L630%20118%20L641%20123%20L654%20123Z%20M-15%20289%20L-4%20281%20L0%20282%20L10%20289%20L13%20300%20L11%20311%20L8%20317%20L1%20320%20L-8%20318%20L-15%20322Z%20M529%201%20L509%2021%20L501%2040%20L502%2046%20L508%2051%20L526%2048%20L536%2038%20L546%2036%20L554%2024%20L554%2012%20L550%204%20L545%201%20L530%201Z%20M301%2055%20L296%2058%20L295%2062%20L305%2067%20L316%2061%20L314%2058%20L302%2055Z%20M150%2096%20L146%20100%20L143%20110%20L152%20122%20L156%20123%20L169%20115%20L172%20104%20L168%2096%20L151%2096Z%20M244%20122%20L245%20134%20L241%20145%20L248%20151%20L262%20151%20L266%20148%20L266%20144%20L261%20132%20L245%20122Z%20M304%20122%20L300%20125%20L301%20130%20L302%20135%20L306%20137%20L310%20126%20L305%20122Z%20M540%20135%20L531%20137%20L518%20154%20L514%20164%20L521%20167%20L526%20165%20L543%20148%20L547%20139%20L541%20135Z%20M364%20136%20L356%20141%20L357%20152%20L374%20161%20L381%20162%20L389%20156%20L401%20154%20L403%20150%20L402%20144%20L398%20142%20L386%20146%20L374%20136%20L365%20136Z%20M466%20179%20L457%20185%20L454%20191%20L456%20197%20L465%20198%20L471%20194%20L474%20185%20L473%20180%20L468%20178Z%20M294%20190%20L288%20200%20L288%20214%20L307%20235%20L306%20251%20L310%20258%20L330%20232%20L331%20226%20L328%20218%20L322%20212%20L312%20208%20L302%20195%20L294%20190Z%20M174%20207%20L167%20219%20L174%20224%20L182%20225%20L190%20221%20L191%20218%20L184%20209%20L175%20207Z%20M598%20220%20L582%20231%20L579%20239%20L581%20243%20L592%20250%20L598%20264%20L601%20276%20L616%20301%20L614%20315%20L628%20312%20L635%20304%20L637%20296%20L634%20280%20L630%20270%20L630%20256%20L627%20249%20L605%20231%20L598%20220Z%20M364%20274%20L352%20288%20L354%20298%20L364%20313%20L378%20316%20L398%20307%20L401%20302%20L401%20298%20L394%20291%20L380%20288%20L373%20276%20L365%20273Z%20M368%20286%20L365%20290%20L370%20292%20L375%20289%20L369%20286Z%20M128%20316%20L121%20324%20L122%20328%20L126%20329%20L132%20326%20L137%20321%20L135%20318%20L129%20316Z%20M112%20-15%20L123%20-9%20L130%209%20L145%2015%20L144%2030%20L155%2050%20L153%2066%20L158%2073%20L167%2081%20L165%2090%20L146%2095%20L141%20106%20L142%20114%20L151%20126%20L155%20128%20L171%20115%20L177%2098%20L190%2086%20L197%2072%20L196%2064%20L189%2056%20L181%2036%20L161%2016%20L166%20-8%20L165%20-15Z%20M300%20-15%20L304%20-9%20L314%20-5%20L317%20-9%20L313%20-15Z%20M617%20-15%20L627%20-6%20L628%209%20L634%2013%20L639%201%20L651%20-7%20L653%20-15Z%20M-15%2074%20L-1%2071%20L10%2077%20L25%2080%20L29%2086%20L25%2096%20L15%20104%20L11%20114%20L3%20124%20L5%20148%20L4%20155%20L-15%20166Z%20M654%20100%20L638%2087%20L620%2092%20L615%2086%20L602%20100%20L591%20107%20L586%20121%20L592%20129%20L609%20130%20L631%20124%20L654%20127Z%20M-15%20245%20L-10%20245%20L-6%20258%20L5%20266%20L2%20275%20L11%20277%20L14%20280%20L17%20308%20L10%20318%20L0%20324%20L-9%20324%20L-15%20334Z%20M-15%20264%20L-9%20265%20L-5%20271%20L-10%20281%20L-15%20286Z%20M83%20336%20L91%20332%20L105%20331%20L112%20334%20L113%20336Z%20M531%20-4%20L522%201%20L515%2012%20L507%2020%20L498%2036%20L497%2042%20L500%2049%20L505%2053%20L512%2055%20L529%2051%20L536%2044%20L546%2041%20L557%2026%20L557%2012%20L552%202%20L532%20-4Z%20M255%2010%20L251%2012%20L247%2020%20L248%2023%20L251%2024%20L256%2023%20L259%2019%20L256%2010Z%20M440%2011%20L434%2016%20L435%2020%20L439%2022%20L444%2018%20L444%2013%20L441%2011Z%20M301%2052%20L293%2058%20L292%2065%20L304%2072%20L311%2081%20L318%2083%20L322%2079%20L318%2070%20L324%2061%20L318%2055%20L302%2052Z%20M90%20107%20L85%20110%20L89%20112%20L95%20109%20L91%20107Z%20M236%20116%20L234%20121%20L240%20134%20L237%20144%20L239%20148%20L248%20153%20L266%20153%20L271%20146%20L271%20136%20L248%20118%20L238%20115Z%20M299%20119%20L296%20122%20L299%20135%20L303%20140%20L309%20141%20L320%20121%20L300%20118Z%20M535%20132%20L529%20135%20L512%20159%20L502%20166%20L505%20170%20L524%20171%20L531%20168%20L551%20138%20L549%20133%20L536%20132Z%20M365%20134%20L354%20139%20L355%20152%20L359%20157%20L372%20163%20L382%20165%20L404%20154%20L408%20146%20L407%20138%20L402%20133%20L396%20139%20L388%20141%20L373%20134%20L366%20133Z%20M46%20167%20L43%20174%20L48%20175%20L52%20169%20L48%20166Z%20M466%20176%20L455%20182%20L451%20188%20L448%20204%20L456%20218%20L459%20209%20L470%20202%20L476%20190%20L477%20180%20L468%20176Z%20M289%20186%20L285%20201%20L286%20215%20L304%20236%20L302%20255%20L304%20263%20L309%20267%20L314%20267%20L317%20264%20L319%20252%20L334%20232%20L336%20226%20L330%20216%20L322%20208%20L314%20204%20L295%20186%20L290%20186Z%20M171%20203%20L164%20212%20L155%20218%20L153%20224%20L160%20227%20L178%20228%20L193%20224%20L198%20219%20L198%20212%20L184%20205%20L172%20203Z%20M596%20216%20L579%20230%20L576%20239%20L580%20245%20L590%20253%20L596%20265%20L599%20276%20L608%20292%20L611%20304%20L604%20312%20L604%20318%20L618%20323%20L632%20310%20L638%20301%20L638%20279%20L632%20265%20L634%20250%20L639%20241%20L634%20237%20L622%20240%20L601%20216%20L598%20215Z%20M469%20226%20L459%20229%20L456%20232%20L458%20241%20L464%20243%20L475%20240%20L478%20238%20L476%20230%20L470%20226Z%20M361%20271%20L349%20287%20L349%20299%20L356%20311%20L362%20317%20L380%20317%20L401%20308%20L404%20301%20L403%20295%20L399%20290%20L386%20285%20L377%20274%20L362%20271Z%20M225%20301%20L222%20304%20L224%20308%20L236%20315%20L239%20311%20L238%20308%20L231%20302%20L226%20301Z%20M129%20311%20L121%20316%20L117%20324%20L118%20332%20L125%20334%20L135%20329%20L142%20320%20L140%20314%20L130%20311Z%20M108%20-15%20L122%202%20L128%2013%20L140%2018%20L141%2031%20L149%2041%20L152%2049%20L150%2061%20L151%2069%20L156%2078%20L164%2082%20L161%2089%20L144%2094%20L139%20108%20L139%20114%20L147%20128%20L154%20132%20L158%20131%20L172%20117%20L182%2099%20L192%2087%20L200%2071%20L199%2060%20L190%2049%20L183%2032%20L164%2016%20L169%20-15Z%20M296%20-15%20L304%20-5%20L315%201%20L321%20-6%20L317%20-15Z%20M613%20-15%20L625%20-5%20L625%2010%20L636%2024%20L639%2022%20L642%204%20L654%20-3Z%20M-15%2071%20L-2%2067%20L9%2073%20L26%2078%20L30%2081%20L31%2086%20L25%20101%20L17%20108%20L6%20125%20L8%20148%20L6%20156%20L-15%20169Z%20M654%2092%20L636%2084%20L614%2081%20L601%2096%20L589%20104%20L583%20121%20L585%20126%20L591%20131%20L609%20133%20L631%20127%20L654%20129Z%20M-15%20238%20L-7%20242%20L-2%20254%20L9%20264%20L18%20278%20L17%20296%20L21%20310%20L20%20314%20L8%20322%20L1%20331%20L-10%20336Z%20M78%20336%20L85%20330%20L88%20321%20L98%20324%20L106%20322%20L125%20308%20L131%20299%20L144%20309%20L145%20316%20L140%20329%20L129%20336Z%20M532%20-8%20L525%20-5%20L519%200%20L514%2011%20L506%2018%20L497%2032%20L491%2048%20L492%2052%20L514%2059%20L533%2052%20L549%2043%20L560%2026%20L560%2012%20L554%201%20L550%20-2%20L534%20-8Z%20M230%20-6%20L227%201%20L234%204%20L236%2015%20L244%2025%20L250%2028%20L258%2026%20L262%2019%20L262%204%20L249%204%20L231%20-7Z%20M442%203%20L432%2011%20L430%2015%20L435%2024%20L442%2025%20L447%2020%20L449%206%20L448%203%20L444%203Z%20M72%2012%20L71%2018%20L81%2023%20L80%2016%20L74%2011Z%20M375%2040%20L371%2045%20L374%2058%20L376%2060%20L385%2048%20L387%2040%20L376%2040Z%20M301%2050%20L291%2056%20L288%2061%20L289%2065%20L309%2084%20L318%2086%20L327%2080%20L326%2070%20L338%2070%20L338%2063%20L318%2052%20L302%2050Z%20M418%2081%20L415%2084%20L417%2092%20L424%20102%20L426%2099%20L425%2085%20L419%2081Z%20M89%20103%20L80%20108%20L78%20114%20L85%20115%20L98%20114%20L102%20111%20L102%20108%20L90%20103Z%20M235%20112%20L230%20121%20L236%20134%20L234%20144%20L236%20149%20L246%20154%20L268%20156%20L278%20151%20L280%20132%20L259%20123%20L250%20115%20L236%20112Z%20M298%20115%20L292%20119%20L290%20122%20L296%20136%20L302%20143%20L311%20144%20L324%20126%20L325%20120%20L318%20115%20L299%20115Z%20M400%20126%20L391%20134%20L368%20131%20L355%20134%20L351%20138%20L352%20149%20L356%20157%20L378%20169%20L384%20175%20L388%20176%20L391%20174%20L394%20164%20L404%20157%20L414%20146%20L409%20132%20L401%20126Z%20M539%20129%20L529%20131%20L511%20155%20L498%20166%20L498%20170%20L501%20173%20L524%20174%20L531%20172%20L535%20169%20L554%20138%20L552%20129%20L540%20129Z%20M616%20152%20L612%20154%20L612%20158%20L614%20162%20L618%20163%20L625%20155%20L622%20152%20L618%20152Z%20M59%20157%20L45%20162%20L41%20166%20L39%20175%20L42%20179%20L46%20180%20L66%20165%20L66%20159%20L60%20157Z%20M120%20174%20L116%20178%20L121%20182%20L125%20179%20L121%20174Z%20M466%20174%20L450%20181%20L443%20205%20L449%20218%20L449%20231%20L453%20240%20L458%20245%20L465%20246%20L479%20244%20L484%20238%20L476%20226%20L463%20219%20L464%20212%20L473%20204%20L482%20180%20L479%20175%20L468%20174Z%20M102%20175%20L105%20177%20L106%20175%20L104%20174Z%20M284%20181%20L280%20185%20L283%20192%20L283%20216%20L301%20237%20L300%20262%20L304%20268%20L311%20271%20L320%20266%20L322%20252%20L329%20241%20L338%20232%20L340%20224%20L324%20205%20L312%20199%20L295%20183%20L285%20181Z%20M171%20191%20L162%20208%20L147%20222%20L146%20227%20L161%20231%20L180%20229%20L196%20226%20L206%20219%20L207%20212%20L205%20209%20L192%20207%20L179%20200%20L172%20191Z%20M598%20212%20L578%20227%20L574%20239%20L592%20261%20L597%20276%20L604%20289%20L606%20301%20L600%20314%20L599%20320%20L602%20323%20L619%20327%20L630%20316%20L640%20302%20L641%20278%20L635%20265%20L642%20254%20L644%20242%20L640%20236%20L620%20232%20L610%20223%20L605%20214%20L599%20212Z%20M2%20216%20L-2%20224%20L5%20227%20L9%20224%20L10%20219%20L9%20216%20L4%20216Z%20M66%20251%20L63%20254%20L63%20259%20L70%20271%20L75%20269%20L76%20265%20L67%20251Z%20M242%20256%20L241%20261%20L245%20262%20L247%20258%20L244%20255Z%20M138%20266%20L126%20272%20L126%20275%20L129%20279%20L139%20282%20L142%20280%20L143%20274%20L138%20266Z%20M362%20267%20L358%20269%20L351%20278%20L345%20291%20L346%20300%20L353%20314%20L361%20322%20L380%20320%20L399%20312%20L407%20301%20L402%20284%20L392%20284%20L380%20271%20L363%20268Z%20M500%20289%20L495%20291%20L493%20298%20L509%20302%20L512%20299%20L510%20294%20L506%20288%20L501%20288Z%20M222%20297%20L218%20302%20L221%20311%20L231%20320%20L236%20322%20L242%20314%20L242%20309%20L232%20298%20L224%20297Z%20M432%20302%20L423%20306%20L428%20310%20L438%20310%20L440%20305%20L434%20302Z%20M103%20-15%20L112%20-8%20L124%2014%20L135%2022%20L137%2032%20L146%2040%20L149%2046%20L147%2066%20L152%2079%20L158%2085%20L143%2091%20L137%20106%20L139%20129%20L144%20139%20L158%20134%20L173%20120%20L203%2071%20L201%2057%20L190%2042%20L188%2029%20L170%2020%20L166%2015%20L173%20-15Z%20M225%20-15%20L227%20-10%20L222%204%20L229%2018%20L245%2032%20L254%2034%20L263%2024%20L266%2013%20L272%204%20L262%20-3%20L252%200%20L245%20-4%20L235%20-15Z%20M292%20-15%20L315%207%20L324%20-6%20L322%20-15Z%20M610%20-15%20L622%20-2%20L623%2010%20L632%2031%20L641%2026%20L645%207%20L654%200Z%20M-15%206%20L-11%208%20L-9%2011%20L-15%2024Z%20M-15%2069%20L-2%2062%20L7%2070%20L29%2078%20L33%2086%20L26%20104%20L18%20111%20L8%20126%20L9%20156%20L2%20162%20L-15%20171Z%20M654%2089%20L636%2082%20L612%2079%20L600%2093%20L586%20102%20L579%20122%20L592%20137%20L601%20135%20L615%20136%20L631%20130%20L654%20131Z%20M-15%20225%20L-9%20229%20L-8%20236%20L3%20254%20L12%20263%20L21%20281%20L20%20298%20L26%20312%20L22%20317%20L10%20324%20L7%20336Z%20M74%20336%20L81%20329%20L84%20318%20L104%20318%20L122%20304%20L128%20293%20L134%20288%20L125%20282%20L122%20271%20L142%20250%20L149%20260%20L145%20285%20L148%20294%20L149%20311%20L144%20328%20L136%20336Z%20M529%20-10%20L517%20-1%20L512%2010%20L483%2046%20L484%2054%20L488%2058%20L501%2057%20L511%2066%20L518%2066%20L524%2059%20L538%2056%20L551%2045%20L560%2032%20L562%2024%20L562%2010%20L556%20-1%20L538%20-11%20L530%20-11Z%20M74%20-4%20L65%2011%20L64%2016%20L75%2031%20L81%2033%20L86%2031%20L86%2021%20L75%20-4Z%20M442%200%20L429%209%20L426%2015%20L436%2028%20L446%2030%20L452%2020%20L453%204%20L451%200%20L444%200Z%20M459%2029%20L450%2035%20L452%2042%20L458%2045%20L470%2038%20L466%2031%20L460%2029Z%20M386%2030%20L381%2035%20L371%2038%20L368%2044%20L371%2064%20L385%2064%20L385%2056%20L395%2036%20L392%2030%20L388%2029Z%20M301%2047%20L294%2051%20L284%2060%20L270%2062%20L262%2071%20L262%2077%20L269%2077%20L280%2068%20L285%2067%20L312%2092%20L330%2086%20L335%2095%20L345%2092%20L350%2098%20L356%2099%20L360%2095%20L361%2088%20L350%2085%20L348%2071%20L340%2060%20L312%2048%20L302%2047Z%20M402%2075%20L404%2084%20L410%2089%20L412%2096%20L408%20109%20L412%20110%20L429%20105%20L433%2080%20L404%2074Z%20M90%20100%20L80%20104%20L73%20111%20L73%20118%20L79%20119%20L102%20117%20L109%20114%20L105%20105%20L91%20100Z%20M309%20107%20L299%20111%20L279%20125%20L260%20119%20L254%20109%20L236%20108%20L230%20112%20L227%20121%20L233%20134%20L231%20145%20L235%20151%20L244%20156%20L271%20161%20L275%20186%20L280%20195%20L280%20216%20L285%20225%20L299%20239%20L298%20266%20L308%20277%20L316%20273%20L323%20266%20L324%20255%20L329%20245%20L341%20233%20L343%20221%20L326%20204%20L312%20196%20L296%20182%20L283%20175%20L279%20162%20L287%20152%20L283%20142%20L286%20137%20L289%20136%20L298%20144%20L311%20148%20L315%20146%20L327%20128%20L328%20118%20L310%20106Z%20M396%20117%20L393%20126%20L389%20130%20L354%20131%20L349%20135%20L350%20148%20L354%20158%20L374%20170%20L382%20181%20L393%20179%20L398%20165%20L418%20146%20L409%20126%20L398%20117Z%20M550%20124%20L529%20127%20L510%20153%20L496%20164%20L495%20170%20L496%20174%20L515%20177%20L519%20180%20L516%20190%20L510%20200%20L511%20205%20L515%20206%20L525%20194%20L524%20180%20L539%20168%20L556%20139%20L557%20126%20L551%20123Z%20M472%20147%20L471%20149%20L472%20151%20L474%20147Z%20M615%20147%20L609%20150%20L608%20158%20L612%20168%20L619%20170%20L634%20164%20L637%20160%20L630%20149%20L616%20147Z%20M60%20153%20L39%20160%20L36%20175%20L41%20181%20L46%20183%20L70%20166%20L69%20156%20L61%20153Z%20M118%20153%20L114%20156%20L110%20168%20L101%20171%20L96%20178%20L100%20181%20L120%20187%20L129%20184%20L138%20175%20L129%20169%20L124%20156%20L119%20153Z%20M479%20162%20L472%20170%20L447%20179%20L445%20193%20L438%20204%20L429%20201%20L425%20202%20L426%20212%20L434%20213%20L439%20212%20L444%20218%20L444%20222%20L438%20228%20L438%20232%20L445%20235%20L459%20248%20L476%20248%20L485%20244%20L488%20240%20L486%20232%20L468%20216%20L486%20180%20L482%20166%20L479%20162Z%20M160%20180%20L158%20184%20L161%20194%20L159%20206%20L140%20226%20L146%20238%20L154%20234%20L214%20228%20L215%20224%20L209%20207%20L188%20201%20L181%20196%20L174%20185%20L161%20179Z%20M612%20192%20L611%20195%20L612%20200%20L604%20208%20L574%20224%20L571%20229%20L570%20238%20L572%20242%20L591%20263%20L596%20278%20L602%20289%20L601%20302%20L595%20316%20L596%20322%20L600%20326%20L619%20330%20L631%20320%20L641%20304%20L645%20281%20L639%20266%20L648%20252%20L644%20236%20L624%20230%20L613%20221%20L612%20216%20L615%20205%20L613%20200%20L616%20195%20L614%20192Z%20M6%20212%20L-2%20216%20L-8%20226%20L-4%20231%20L4%20231%20L10%20229%20L14%20221%20L12%20214%20L8%20212Z%20M61%20239%20L57%20245%20L60%20262%20L58%20272%20L68%20279%20L77%20271%20L80%20265%20L68%20243%20L62%20239Z%20M238%20242%20L234%20245%20L236%20254%20L236%20264%20L238%20268%20L242%20269%20L249%20265%20L252%20256%20L242%20243%20L239%20242Z%20M361%20264%20L348%20274%20L340%20285%20L344%20301%20L359%20329%20L366%20325%20L382%20321%20L400%20314%20L411%20306%20L430%20315%20L440%20314%20L445%20308%20L443%20301%20L435%20297%20L412%20300%20L409%20295%20L405%20278%20L392%20276%20L382%20269%20L362%20264Z%20M288%20277%20L288%20281%20L291%20284%20L301%20288%20L308%20287%20L310%20282%20L308%20278%20L299%20282%20L289%20277Z%20M505%20282%20L488%20291%20L478%20293%20L476%20296%20L491%20306%20L509%20306%20L521%20298%20L522%20295%20L514%20290%20L506%20282Z%20M224%20292%20L219%20294%20L215%20299%20L217%20315%20L225%20322%20L236%20328%20L241%20322%20L245%20309%20L234%20294%20L225%20292Z%20M40%20300%20L31%20310%20L33%20314%20L39%20317%20L54%20302%20L51%20300%20L41%20300Z%20M68%20-15%20L67%20-4%20L61%2010%20L61%2024%20L68%2035%20L86%2038%20L91%2035%20L89%2020%20L82%209%20L80%20-5%20L74%20-15Z%20M95%20-15%20L109%20-8%20L119%2011%20L130%2024%20L135%2035%20L146%2044%20L148%2050%20L144%2066%20L148%2082%20L140%2090%20L130%20115%20L119%20114%20L106%20102%20L88%2097%20L82%2099%20L70%20111%20L68%20115%20L70%20122%20L75%20127%20L91%20120%20L110%20120%20L121%20135%20L125%20136%20L132%20131%20L138%20142%20L144%20145%20L150%20143%20L175%20122%20L187%2099%20L205%2072%20L205%2052%20L195%2042%20L190%2025%20L186%2022%20L172%2018%20L168%2012%20L172%20-4%20L181%20-15Z%20M222%20-15%20L224%20-10%20L219%201%20L220%209%20L229%2022%20L238%2029%20L245%2038%20L252%2041%20L259%2039%20L277%202%20L265%20-10%20L249%20-6%20L243%20-9%20L239%20-15Z%20M287%20-15%20L309%208%20L315%2010%20L319%209%20L327%20-5%20L329%20-15Z%20M531%20-15%20L515%20-1%20L510%209%20L498%2024%20L481%2036%20L475%2035%20L461%2021%20L456%2011%20L455%200%20L452%20-3%20L435%20-2%20L424%2011%20L425%2020%20L436%2031%20L445%2035%20L454%2047%20L459%2049%20L468%2047%20L474%2050%20L484%2064%20L488%2074%20L492%2076%20L498%2071%20L499%2062%20L514%2072%20L523%2069%20L530%2062%20L540%2060%20L555%2047%20L562%2033%20L567%208%20L555%20-6%20L536%20-15Z%20M607%20-15%20L618%202%20L626%2029%20L632%2035%20L636%2035%20L643%2029%20L646%2014%20L654%203Z%20M-15%204%20L-8%205%20L-6%2010%20L-8%2020%20L-15%2030Z%20M-15%2066%20L-10%2064%20L-6%2055%20L-1%2054%20L8%2067%20L32%2078%20L36%2089%20L28%20109%20L20%20115%20L11%20128%20L13%20158%20L1%20167%20L-15%20173Z%20M654%2087%20L635%2079%20L610%2077%20L584%20100%20L580%20114%20L573%20122%20L584%20134%20L590%20147%20L602%20139%20L609%20141%20L603%20149%20L604%20160%20L610%20170%20L616%20173%20L632%20169%20L640%20160%20L633%20145%20L620%20142%20L620%20139%20L630%20133%20L654%20133Z%20M-15%20220%20L-11%20220%20L0%20211%20L11%20210%20L16%20214%20L17%20230%20L6%20238%20L5%20250%20L14%20261%20L22%20279%20L22%20296%20L28%20302%20L43%20291%20L46%20285%20L52%20280%20L56%20261%20L52%20246%20L58%20236%20L61%20234%20L65%20236%20L81%20260%20L82%20266%20L71%20282%20L60%20284%20L60%20302%20L64%20306%20L80%20311%20L100%20315%20L107%20312%20L121%20298%20L123%20289%20L119%20270%20L138%20245%20L136%20226%20L155%20206%20L156%20192%20L154%20181%20L156%20178%20L160%20175%20L165%20176%20L178%20184%20L188%20198%20L210%20204%20L220%20224%20L218%20234%20L201%20234%20L190%20231%20L175%20233%20L150%20246%20L153%20259%20L149%20281%20L152%20292%20L151%20310%20L147%20325%20L142%20336Z%20M13%20336%20L12%20326%20L20%20323%20L24%20326%20L19%20336Z%20M29%20336%20L35%20334%20L37%20324%20L49%20312%20L56%20309%20L77%20325%20L71%20336Z%20M197%20336%20L213%20328%20L210%20318%20L212%20296%20L219%20289%20L226%20286%20L239%20291%20L248%20310%20L241%20334%20L230%20336Z%20M361%20336%20L353%20331%20L351%20320%20L336%20291%20L325%20288%20L302%20292%20L291%20288%20L284%20282%20L283%20275%20L292%20269%20L297%20241%20L284%20228%20L278%20218%20L277%20198%20L269%20182%20L267%20165%20L262%20161%20L236%20154%20L228%20145%20L230%20134%20L225%20120%20L233%2091%20L238%2090%20L241%2092%20L244%20104%20L249%20103%20L254%2098%20L258%2098%20L262%20113%20L274%20117%20L286%20115%20L303%20104%20L305%2090%20L285%2072%20L280%2072%20L258%2087%20L254%2087%20L251%2084%20L260%2066%20L266%2059%20L282%2056%20L296%2046%20L308%2043%20L340%2056%20L356%2070%20L356%2076%20L364%2081%20L365%2085%20L362%20100%20L359%20104%20L342%20100%20L332%20102%20L325%2095%20L321%2095%20L319%20101%20L320%20106%20L326%20110%20L335%20110%20L339%20114%20L315%20150%20L310%20152%20L298%20150%20L296%20155%20L288%20159%20L284%20164%20L286%20173%20L338%20210%20L346%20220%20L344%20235%20L330%20248%20L322%20276%20L339%20277%20L351%20268%20L359%20259%20L362%20258%20L371%20264%20L408%20274%20L410%20278%20L413%20295%20L434%20293%20L444%20299%20L447%20305%20L447%20312%20L440%20318%20L429%20319%20L418%20312%20L410%20311%20L371%20326%20L367%20330%20L368%20336Z%20M541%20336%20L548%20328%20L552%20326%20L562%20331%20L565%20336Z%20M389%2025%20L368%2037%20L366%2045%20L366%2061%20L363%2070%20L365%2073%20L378%2068%20L394%2071%20L404%2094%20L404%2099%20L401%20102%20L395%20103%20L390%20107%20L389%20122%20L386%20127%20L380%20129%20L369%20127%20L351%20128%20L346%20134%20L349%20151%20L354%20161%20L371%20173%20L378%20183%20L382%20184%20L395%20182%20L401%20166%20L420%20149%20L420%20144%20L412%20120%20L432%20106%20L433%2091%20L439%2081%20L436%2077%20L428%2073%20L412%2061%20L405%2062%20L399%2067%20L395%2066%20L390%2055%20L399%2035%20L396%2028%20L390%2025Z%20M549%20120%20L528%20125%20L517%20136%20L508%20152%20L490%20162%20L486%20159%20L480%20144%20L474%20142%20L469%20143%20L465%20150%20L471%20162%20L469%20168%20L441%20179%20L442%20191%20L438%20197%20L415%20195%20L415%20199%20L420%20208%20L420%20219%20L429%20225%20L438%20240%20L459%20250%20L474%20251%20L488%20245%20L491%20240%20L489%20231%20L474%20216%20L481%20194%20L491%20179%20L496%20178%20L513%20182%20L506%20200%20L511%20211%20L516%20211%20L527%20201%20L530%20181%20L544%20165%20L558%20140%20L562%20128%20L559%20121%20L550%20119Z%20M62%20148%20L50%20154%20L38%20155%20L34%20158%20L34%20175%20L41%20185%20L46%20186%20L72%20169%20L72%20156%20L68%20150%20L64%20148Z%20M116%20150%20L111%20153%20L106%20164%20L93%20176%20L96%20182%20L119%20191%20L133%20185%20L141%20180%20L144%20175%20L132%20162%20L125%20150%20L118%20149Z%20M610%20187%20L607%20190%20L606%20200%20L602%20205%20L585%20216%20L562%20224%20L558%20229%20L567%20242%20L590%20264%20L599%20288%20L598%20302%20L590%20315%20L590%20320%20L599%20328%20L619%20333%20L625%20330%20L642%20308%20L649%20288%20L644%20266%20L651%20254%20L650%20241%20L647%20235%20L625%20228%20L617%20221%20L616%20215%20L622%20194%20L619%20189%20L611%20187Z%20M235%20239%20L228%20242%20L232%20254%20L233%20268%20L236%20272%20L244%20273%20L251%20266%20L255%20252%20L245%20238%20L236%20238Z%20M508%20276%20L488%20287%20L472%20291%20L472%20296%20L476%20302%20L494%20310%20L510%20308%20L527%20300%20L525%20290%20L516%20286%20L508%20276Z%20M1%20-15%20L4%20-11%20L8%20-9%20L21%20-15Z%20M56%20-15%20L54%208%20L50%2011%20L39%209%20L38%2018%20L42%2024%20L52%2023%20L59%2036%20L69%2044%20L75%2052%20L80%2051%20L94%2041%20L97%2036%20L94%2018%20L87%204%20L89%20-4%20L96%20-7%20L105%20-4%20L125%2026%20L131%2041%20L140%2045%20L143%2049%20L129%2070%20L135%2082%20L130%20101%20L120%20103%20L90%2091%20L80%2091%20L72%20102%20L61%20111%20L62%20124%20L58%20142%20L49%20149%20L32%20148%20L28%20142%20L20%20142%20L17%20139%20L16%20131%20L19%20127%20L32%20129%20L35%20101%20L42%2089%20L34%2074%20L22%2068%20L10%2057%20L6%2046%20L-2%2035%20L0%202%20L-4%200%20L-15%20-1Z%20M192%20-15%20L179%20-5%20L174%208%20L178%2011%20L194%2017%20L198%2028%20L213%2041%20L214%2051%20L210%2061%20L210%2074%20L185%20114%20L184%20140%20L179%20143%20L166%20141%20L154%20150%20L138%20154%20L137%20158%20L148%20167%20L159%20169%20L181%20176%20L192%20191%20L220%20204%20L225%20211%20L231%20213%20L238%20218%20L239%20229%20L251%20234%20L262%20249%20L263%20252%20L255%20271%20L262%20284%20L252%20299%20L252%20316%20L249%20328%20L254%20336Z%20M214%20-15%20L217%20-10%20L214%201%20L215%2011%20L249%2050%20L252%2059%20L249%2074%20L239%2077%20L234%2084%20L227%2089%20L220%20104%20L218%20124%20L221%20135%20L218%20150%20L232%20159%20L255%20163%20L260%20166%20L262%20180%20L273%20204%20L274%20219%20L291%20244%20L290%20249%20L284%20254%20L282%20260%20L275%20267%20L275%20281%20L289%20292%20L310%20301%20L319%20300%20L336%20304%20L342%20311%20L347%20322%20L347%20331%20L343%20336Z%20M354%20-15%20L336%20-8%20L318%2017%20L306%2015%20L295%205%20L284%207%20L264%2044%20L268%2049%20L278%2049%20L299%2039%20L310%2039%20L330%2049%20L341%2051%20L349%2059%20L354%2060%20L360%2058%20L361%2045%20L364%2034%20L373%2026%20L381%209%20L389%20-1%20L395%200%20L396%209%20L400%2011%20L404%208%20L402%200%20L406%20-4%20L422%20-3%20L435%20-8%20L458%20-9%20L462%20-6%20L462%209%20L479%2021%20L496%2016%20L505%208%20L511%20-4%20L521%20-15Z%20M550%20-15%20L572%200%20L576%206%20L575%2012%20L568%2022%20L563%2046%20L558%2055%20L522%2075%20L512%2087%20L490%2082%20L475%2061%20L469%2057%20L458%2055%20L441%2039%20L422%2027%20L418%2026%20L409%2034%20L403%2045%20L404%2051%20L428%2063%20L440%2072%20L445%2081%20L438%2092%20L436%20106%20L424%20119%20L422%20134%20L425%20151%20L405%20176%20L404%20181%20L406%20185%20L425%20187%20L432%20174%20L446%20167%20L458%20165%20L459%20149%20L462%20142%20L468%20138%20L474%20137%20L484%20139%20L494%20148%20L499%20150%20L503%20146%20L502%20134%20L515%20123%20L546%20114%20L568%20116%20L575%20109%20L577%2099%20L585%2084%20L599%2072%20L618%2072%20L635%2075%20L654%2083Z%20M599%20-15%20L606%20-8%20L615%2016%20L618%2032%20L630%2042%20L636%2042%20L649%2032%20L650%2019%20L654%2013Z%20M654%20137%20L646%20141%20L646%20161%20L624%20182%20L630%20221%20L654%20236Z%20M-15%20179%20L-5%20173%20L22%20174%20L45%20196%20L58%20187%20L72%20179%20L85%20181%20L95%20188%20L105%20190%20L109%20194%20L117%20211%20L116%20221%20L110%20231%20L121%20245%20L118%20252%20L105%20247%20L86%20254%20L80%20248%20L69%20231%20L62%20228%20L58%20229%20L52%20234%20L44%20249%20L44%20254%20L50%20261%20L48%20270%20L44%20277%20L31%20286%20L14%20251%20L16%20245%20L28%20241%20L31%20238%20L22%20212%20L16%20206%20L11%20205%20L-5%20205%20L-15%20211Z%20M654%20301%20L648%20304%20L647%20318%20L638%20323%20L623%20336Z%20M42%20336%20L46%20323%20L55%20317%20L67%20328%20L66%20336Z%20M160%20336%20L153%20329%20L157%20300%20L160%20296%20L172%20295%20L175%20289%20L170%20283%20L155%20282%20L154%20271%20L167%20242%20L174%20238%20L186%20235%20L200%20242%20L218%20245%20L219%20256%20L224%20268%20L208%20295%20L205%20306%20L200%20314%20L201%20328%20L196%20332%20L182%20336Z%20M376%20336%20L379%20330%20L389%20328%20L399%20321%20L416%20318%20L433%20326%20L437%20336Z%20M466%20336%20L466%20329%20L460%20315%20L454%20309%20L450%20296%20L434%20285%20L419%20284%20L412%20268%20L398%20262%20L402%20243%20L395%20242%20L387%20248%20L389%20258%20L385%20260%20L359%20248%20L350%20235%20L351%20216%20L347%20208%20L320%20192%20L293%20170%20L293%20166%20L311%20159%20L336%20135%20L342%20144%20L349%20165%20L362%20186%20L372%20192%20L389%20191%20L403%20196%20L409%20210%20L399%20207%20L391%20208%20L388%20211%20L389%20216%20L396%20223%20L408%20220%20L412%20232%20L419%20232%20L424%20234%20L428%20251%20L431%20255%20L452%20253%20L476%20258%20L489%20254%20L495%20249%20L497%20244%20L494%20226%20L485%20220%20L483%20214%20L486%20198%20L496%20186%20L503%20188%20L500%20199%20L503%20211%20L500%20222%20L520%20219%20L536%20212%20L542%20213%20L546%20216%20L546%20226%20L549%20231%20L564%20248%20L584%20264%20L588%20270%20L592%20296%20L589%20301%20L579%20306%20L583%20322%20L599%20334%20L616%20336Z%20M534%20336%20L544%20325%20L555%20317%20L569%20330%20L571%20336Z%20M412%201%20L408%206%20L415%2012%20L419%204%20L414%201Z%20M378%2075%20L371%2091%20L372%20104%20L352%20119%20L358%20122%20L378%20121%20L381%20118%20L384%20104%20L390%2095%20L392%2085%20L389%2079%20L379%2075Z%20M280%2079%20L268%2090%20L268%20104%20L271%20108%20L288%20109%20L298%20101%20L300%2094%20L292%2084%20L281%2078Z%20M90%20126%20L78%20136%20L77%20150%20L79%20165%20L85%20169%20L91%20168%20L101%20160%20L112%20138%20L108%20129%20L91%20125Z%20M568%20134%20L542%20174%20L540%20182%20L545%20190%20L545%20200%20L558%20198%20L573%20211%20L582%20212%20L601%20199%20L600%20174%20L598%20169%20L590%20162%20L584%20154%20L579%20136%20L569%20133Z%20M140%20187%20L126%20194%20L121%20200%20L120%20209%20L123%20221%20L129%20223%20L146%20211%20L150%20205%20L148%20189%20L146%20186%20L141%20187Z%20M412%20236%20L411%20240%20L414%20240%20L414%20236Z%20M338%20252%20L334%20256%20L334%20264%20L335%20268%20L339%20268%20L348%20264%20L350%20259%20L349%20255%20L339%20252Z%20M106%20264%20L90%20268%20L81%20278%20L74%20291%20L68%20295%20L70%20298%20L78%20296%20L86%20304%20L99%20306%20L114%20297%20L117%20291%20L113%20269%20L111%20265%20L106%20264Z%20M509%20264%20L499%20274%20L469%20286%20L466%20291%20L466%20296%20L472%20306%20L490%20314%20L518%20311%20L530%20315%20L534%20312%20L536%20308%20L531%20291%20L527%20284%20L520%20278%20L515%20266%20L510%20263Z%20M36%20-15%20L33%20-11%20L19%20-10%20L4%20-3%20L2%2031%20L4%2037%20L11%2043%20L13%2055%20L22%2065%20L35%2072%20L40%2082%20L48%2090%20L48%2092%20L39%20100%20L37%20121%20L39%20141%20L48%20146%20L54%20144%20L56%20140%20L57%20122%20L55%20112%20L59%20101%20L68%20103%20L75%2091%20L85%2088%20L116%2099%20L129%2096%20L132%2082%20L124%2070%20L134%2052%20L126%2042%20L122%2026%20L102%20-1%20L98%20-3%20L92%20-1%20L91%204%20L100%2024%20L99%2036%20L81%2055%20L78%2056%20L72%2054%20L51%2029%20L39%2026%20L33%2014%20L32%208%20L36%200%20L48%205%20L52%204%20L49%20-15Z%20M197%20-15%20L184%20-6%20L180%202%20L196%2014%20L201%2026%20L218%2040%20L213%2062%20L212%2075%20L196%20100%20L194%20109%20L190%20115%20L188%20128%20L190%20141%20L184%20151%20L181%20153%20L168%20147%20L155%20154%20L145%20155%20L142%20159%20L148%20163%20L182%20172%20L194%20189%20L204%20191%20L212%20198%20L234%20206%20L242%20218%20L244%20225%20L254%20232%20L264%20245%20L278%20246%20L284%20245%20L285%20240%20L271%20220%20L270%20205%20L257%20180%20L256%20168%20L248%20164%20L230%20162%20L219%20156%20L214%20151%20L216%20139%20L214%20119%20L216%20104%20L224%2088%20L232%2081%20L235%2072%20L246%2068%20L250%2059%20L246%2050%20L212%2011%20L211%20-1%20L213%20-10%20L211%20-15Z%20M364%20-15%20L338%20-5%20L322%2016%20L318%2019%20L306%2021%20L295%209%20L286%2010%20L270%2039%20L271%2042%20L276%2044%20L300%2036%20L308%2036%20L331%2047%20L342%2049%20L354%2056%20L358%2054%20L362%2032%20L371%2024%20L382%20-1%20L381%20-9%20L374%20-15Z%20M388%20-15%20L387%20-9%20L394%20-7%20L405%20-10%20L420%20-8%20L457%20-15Z%20M463%20-15%20L467%20-9%20L465%208%20L472%2013%20L484%2016%20L502%207%20L517%20-15Z%20M555%20-15%20L562%20-9%20L575%20-4%20L579%206%20L579%2014%20L570%2024%20L566%2048%20L559%2057%20L525%2076%20L518%2088%20L512%2091%20L504%2094%20L499%2092%20L483%2078%20L474%2063%20L458%2058%20L438%2040%20L422%2033%20L409%2040%20L406%2045%20L408%2049%20L441%2070%20L448%2080%20L447%2085%20L441%2092%20L438%20106%20L427%20121%20L425%20136%20L432%20159%20L431%20166%20L435%20167%20L442%20162%20L453%20160%20L460%20142%20L468%20135%20L484%20136%20L496%20144%20L500%20131%20L512%20119%20L520%20117%20L525%20112%20L535%20114%20L546%20110%20L566%20113%20L572%20106%20L576%2091%20L599%2069%20L616%2069%20L654%2080Z%20M596%20-15%20L604%20-6%20L608%2016%20L611%2022%20L612%2030%20L606%2040%20L610%2047%20L614%2047%20L621%2042%20L632%2046%20L642%2041%20L652%2031%20L654%2018Z%20M654%20141%20L650%20146%20L650%20160%20L631%20181%20L629%20188%20L634%20220%20L654%20231Z%20M-15%20182%20L-4%20175%20L21%20179%20L31%20186%20L39%20198%20L48%20201%20L60%20189%20L72%20184%20L84%20184%20L106%20194%20L112%20214%20L109%20223%20L89%20235%20L89%20245%20L88%20248%20L82%20246%20L78%20235%20L66%20225%20L61%20224%20L52%20227%20L40%20249%20L41%20254%20L47%20262%20L47%20268%20L42%20275%20L34%20279%20L24%20264%20L19%20252%20L20%20249%20L31%20246%20L35%20236%20L29%20224%20L26%20212%20L12%20201%20L-5%20201%20L-15%20207Z%20M45%20336%20L48%20326%20L54%20322%20L63%20328%20L64%20336Z%20M166%20336%20L157%20321%20L159%20302%20L162%20299%20L177%20298%20L183%20291%20L176%20282%20L168%20279%20L158%20278%20L157%20272%20L169%20245%20L175%20241%20L186%20238%20L199%20246%20L211%20249%20L211%20256%20L219%20268%20L212%20285%20L196%20312%20L197%20328%20L178%20336Z%20M277%20336%20L272%20334%20L260%20335%20L255%20332%20L252%20327%20L256%20295%20L261%20289%20L271%20287%20L301%20299%20L310%20307%20L332%20306%20L340%20311%20L345%20324%20L342%20333%20L331%20336%20L314%20332%20L308%20336Z%20M380%20336%20L399%20324%20L416%20322%20L430%20328%20L433%20336Z%20M470%20336%20L464%20312%20L457%20306%20L454%20294%20L442%20287%20L436%20281%20L425%20282%20L420%20279%20L415%20266%20L404%20260%20L405%20251%20L409%20247%20L416%20246%20L421%20248%20L431%20259%20L454%20255%20L482%20263%20L492%20260%20L498%20253%20L500%20246%20L498%20235%20L500%20229%20L536%20216%20L541%20219%20L543%20230%20L556%20242%20L566%20259%20L580%20264%20L586%20271%20L589%20285%20L588%20295%20L585%20298%20L573%20302%20L572%20308%20L580%20324%20L590%20330%20L595%20336Z%20M531%20336%20L548%20318%20L553%20306%20L560%20303%20L563%20305%20L565%20310%20L564%20321%20L579%20336Z%20M281%2081%20L272%2089%20L271%2098%20L274%20102%20L286%20106%20L294%20103%20L297%2095%20L292%2086%20L282%2081Z%20M378%2092%20L376%2096%20L380%2099%20L384%2094%20L379%2092Z%20M375%20109%20L369%20111%20L366%20115%20L372%20118%20L378%20114%20L376%20108Z%20M94%20130%20L84%20135%20L80%20151%20L81%20162%20L88%20166%20L98%20160%20L108%20138%20L106%20132%20L95%20130Z%20M569%20137%20L545%20172%20L543%20180%20L554%20192%20L578%20209%20L582%20210%20L597%20199%20L599%20189%20L593%20170%20L581%20154%20L577%20140%20L570%20137Z%20M332%20146%20L324%20150%20L310%20162%20L300%20168%20L299%20171%20L305%20179%20L322%20192%20L354%20205%20L360%20196%20L355%20180%20L341%20149%20L338%20146%20L334%20146Z%20M422%20166%20L416%20170%20L414%20176%20L416%20181%20L421%20183%20L425%20181%20L427%20172%20L427%20169%20L424%20166Z%20M140%20191%20L129%20196%20L125%20200%20L125%20210%20L130%20218%20L143%20210%20L147%20205%20L146%20195%20L141%20191Z%20M368%20196%20L365%20205%20L354%20220%20L352%20231%20L364%20245%20L372%20247%20L399%20236%20L402%20230%20L389%20226%20L383%20211%20L386%20202%20L397%20200%20L369%20196Z%20M490%20205%20L490%20209%20L495%20210%20L497%20209%20L491%20205Z%20M111%20241%20L112%20244%20L115%20245%20L115%20242%20L112%20240Z%20M268%20256%20L262%20260%20L258%20269%20L260%20273%20L268%20278%20L270%20275%20L273%20260%20L269%20256Z%20M505%20259%20L501%20261%20L498%20270%20L486%20273%20L480%20279%20L466%20284%20L462%20292%20L462%20298%20L469%20308%20L489%20315%20L516%20314%20L531%20318%20L536%20315%20L540%20308%20L533%20290%20L516%20263%20L506%20259Z%20M105%20267%20L89%20274%20L80%20284%20L80%20289%20L86%20297%20L95%20300%20L109%20297%20L114%20291%20L112%20274%20L106%20267Z%20M469%20-15%20L471%20-6%20L470%205%20L480%2010%20L489%204%20L498%206%20L501%204%20L514%20-15Z%20M558%20-15%20L566%20-11%20L578%20-13%20L584%20-5%20L582%201%20L582%2014%20L572%2024%20L568%2049%20L560%2059%20L541%2072%20L526%2078%20L520%2090%20L508%2098%20L496%2096%20L472%2065%20L456%2061%20L435%2041%20L421%2037%20L411%2041%20L411%2048%20L444%2068%20L450%2079%20L440%20106%20L429%20121%20L429%20139%20L438%20156%20L442%20158%20L450%20156%20L460%20138%20L465%20134%20L474%20132%20L490%20135%20L494%20134%20L507%20120%20L506%20109%20L509%20104%20L526%20105%20L535%20110%20L544%20107%20L566%20106%20L570%2099%20L568%2085%20L579%2083%20L600%2065%20L616%2062%20L625%2068%20L654%2078Z%20M592%20-15%20L599%20-6%20L603%206%20L600%2024%20L601%2044%20L604%2049%20L614%2052%20L622%2046%20L635%2049%20L646%2043%20L654%2034Z%20M654%20160%20L634%20182%20L632%20189%20L636%20219%20L645%20225%20L654%20229Z%20M-15%20185%20L-2%20177%20L20%20182%20L29%20188%20L43%20209%20L41%20225%20L38%20228%20L32%20224%20L29%20211%20L16%20199%20L-5%20198%20L-15%20203Z%20M48%20336%20L50%20329%20L54%20326%20L60%20329%20L61%20336Z%20M282%20336%20L274%20332%20L261%20332%20L256%20326%20L258%20318%20L256%20305%20L258%20298%20L261%20292%20L270%20290%20L279%20292%20L288%20297%20L299%20301%20L312%20312%20L321%20309%20L334%20310%20L339%20313%20L343%20324%20L340%20330%20L330%20333%20L312%20329%20L303%20336Z%20M385%20336%20L400%20326%20L416%20324%20L426%20330%20L429%20336Z%20M473%20336%20L468%20319%20L470%20315%20L474%20313%20L491%20318%20L519%20317%20L534%20325%20L532%20331%20L526%20336Z%20M202%20-14%20L188%20-5%20L188%20-2%20L194%203%20L201%2012%20L203%2025%20L222%2034%20L219%2024%20L208%2011%20L206%20-2%20L208%20-11%20L204%20-15Z%20M366%20-13%20L340%20-3%20L321%2020%20L306%2026%20L302%2025%20L295%2012%20L289%2012%20L276%2034%20L278%2038%20L285%2039%20L305%2031%20L331%2045%20L351%2048%20L355%2045%20L361%2029%20L368%2022%20L377%200%20L374%20-9%20L368%20-13Z%20M16%20-5%20L11%20-1%20L6%2011%20L6%2032%20L14%2041%20L17%2055%20L25%2063%20L34%2064%20L43%2082%20L64%2089%20L90%2086%20L110%2095%20L122%2095%20L127%2092%20L129%2088%20L128%2081%20L121%2072%20L126%2051%20L121%2042%20L120%2028%20L111%2019%20L106%209%20L102%207%20L101%2010%20L107%2022%20L101%2038%20L84%2056%20L76%2059%20L69%2055%20L49%2034%20L36%2028%20L27%2010%20L29%20-2%20L25%20-5%20L18%20-6Z%20M228%2037%20L216%2060%20L215%2076%20L206%2087%20L197%20116%20L199%20124%20L196%20132%20L200%20141%20L200%20148%20L185%20159%20L183%20165%20L196%20187%20L205%20188%20L215%20197%20L231%20200%20L241%20200%20L241%20210%20L249%20225%20L265%20239%20L271%20237%20L276%20239%20L278%20238%20L271%20234%20L262%20211%20L262%20195%20L259%20189%20L254%20187%20L246%20195%20L243%20192%20L243%20189%20L251%20180%20L251%20169%20L244%20166%20L229%20166%20L215%20157%20L210%20150%20L212%20128%20L209%20118%20L212%20100%20L220%2086%20L228%2080%20L233%2069%20L244%2065%20L246%2060%20L245%2054%20L239%2045%20L229%2037Z%20M279%2085%20L276%2090%20L277%2096%20L286%20102%20L291%20102%20L295%2098%20L293%2091%20L288%2086%20L280%2084Z%20M44%20100%20L42%20107%20L45%20110%20L48%20110%20L51%20102%20L49%2099%20L45%2099Z%20M46%20134%20L46%20139%20L50%20141%20L51%20136%20L48%20133Z%20M98%20134%20L92%20136%20L90%20146%20L83%20154%20L84%20160%20L89%20162%20L93%20160%20L104%20142%20L104%20136%20L99%20134Z%20M569%20142%20L549%20170%20L546%20179%20L578%20206%20L584%20207%20L595%20197%20L597%20190%20L590%20170%20L575%20154%20L572%20143%20L570%20142Z%20M331%20150%20L325%20152%20L305%20169%20L304%20174%20L325%20190%20L351%20198%20L353%20191%20L351%20179%20L340%20152%20L338%20150%20L332%20149Z%20M165%20151%20L158%20156%20L158%20161%20L165%20166%20L172%20167%20L176%20164%20L176%20158%20L171%20151%20L166%20151Z%20M70%20187%20L58%20193%20L54%20199%20L54%20204%20L73%20225%20L81%20229%20L88%20229%20L99%20224%20L106%20216%20L106%20200%20L102%20195%20L85%20188%20L71%20187Z%20M134%20197%20L129%20200%20L128%20205%20L129%20211%20L132%20213%20L143%20202%20L141%20197%20L135%20197Z%20M366%20211%20L355%20225%20L354%20230%20L360%20238%20L369%20241%20L379%20219%20L375%20213%20L368%20211Z%20M524%20224%20L512%20226%20L503%20232%20L503%20251%20L519%20262%20L533%20282%20L539%20297%20L546%20305%20L555%20300%20L583%20295%20L587%20288%20L586%20275%20L579%20266%20L564%20264%20L555%20246%20L544%20237%20L536%20236%20L532%20225%20L525%20224Z%20M184%20241%20L171%20248%20L160%20272%20L163%20275%20L186%20280%20L198%20299%20L209%20286%20L216%20266%20L201%20252%20L185%20241Z%20M414%20250%20L409%20252%20L408%20256%20L420%20265%20L424%20276%20L435%20275%20L446%20283%20L458%20288%20L466%20279%20L477%20274%20L478%20270%20L475%20265%20L454%20257%20L429%20264%20L420%20252%20L415%20250Z%20M29%20253%20L26%20256%20L27%20261%20L36%20271%20L40%20271%20L44%20267%20L44%20262%20L36%20254%20L30%20253Z%20M266%20262%20L262%20268%20L265%20271%20L268%20268%20L267%20262Z%20M104%20271%20L90%20278%20L84%20284%20L84%20288%20L90%20295%20L98%20297%20L109%20294%20L112%20290%20L111%20275%20L105%20271Z%20M165%20302%20L161%20306%20L160%20320%20L166%20331%20L172%20335%20L191%20327%20L193%20321%20L190%20311%20L181%20304%20L166%20302Z%20M472%20-15%20L476%20-2%20L480%202%20L499%201%20L510%20-15Z%20M654%2038%20L648%2047%20L636%2054%20L625%2051%20L622%2055%20L626%2064%20L654%2075Z%20M654%20165%20L644%20174%20L635%20189%20L638%20218%20L646%20224%20L654%20226Z%20M-15%20188%20L-2%20180%20L17%20185%20L30%20197%20L37%20209%20L35%20211%20L26%20204%20L20%20195%20L5%20196%20L-5%20195%20L-15%20199Z%20M52%20336%20L54%20332%20L56%20334%20L56%20336Z%20M290%20336%20L260%20326%20L258%20301%20L262%20295%20L270%20293%20L298%20302%20L309%20315%20L312%20324%20L296%20336Z%20M390%20336%20L401%20328%20L415%20327%20L421%20329%20L426%20336Z%20M475%20336%20L472%20320%20L478%20316%20L491%20319%20L519%20319%20L529%20328%20L528%20331%20L521%20336Z%20M361%20-9%20L340%201%20L322%2022%20L312%2030%20L331%2042%20L351%2042%20L366%2018%20L371%20-1%20L369%20-8%20L362%20-9Z%20M592%202%20L586%206%20L585%2016%20L574%2025%20L571%2046%20L565%2058%20L545%2074%20L528%2080%20L522%2092%20L517%2098%20L535%20102%20L561%20100%20L566%2095%20L562%2085%20L562%2081%20L579%2079%20L600%2059%20L597%2049%20L596%2030%20L599%208%20L598%204%20L594%202Z%20M12%2012%20L9%2016%20L9%2031%20L17%2041%20L21%2054%20L26%2058%20L36%2053%20L43%2039%20L24%2016%20L14%2012Z%20M289%2016%20L282%2028%20L281%2034%20L286%2036%20L294%2034%20L298%2029%20L297%2022%20L294%2016%20L290%2015Z%20M209%2020%20L207%2022%20L211%2025%20L214%2024%20L210%2020Z%20M111%2028%20L80%2062%20L75%2062%20L59%2053%20L42%2059%20L38%2066%20L42%2078%20L48%2082%20L71%2085%20L91%2083%20L104%2090%20L118%2092%20L124%2089%20L125%2085%20L118%2075%20L120%2051%20L116%2031%20L112%2028Z%20M419%2041%20L414%2044%20L415%2046%20L425%2054%20L448%2064%20L453%2076%20L449%2093%20L432%20121%20L434%20140%20L441%20146%20L444%20152%20L446%20153%20L461%20132%20L471%20130%20L489%20132%20L494%20130%20L503%20120%20L502%20105%20L493%2096%20L470%2066%20L454%2064%20L439%2051%20L434%2043%20L420%2041Z%20M230%2044%20L224%2050%20L218%2062%20L220%2075%20L224%2077%20L232%2064%20L243%2059%20L236%2046%20L231%2043Z%20M282%2088%20L282%2095%20L289%2099%20L291%2094%20L284%2088Z%20M331%20152%20L318%20161%20L309%20170%20L308%20174%20L326%20188%20L339%20185%20L346%20187%20L348%20181%20L341%20158%20L338%20153%20L332%20152Z%20M202%20154%20L188%20164%20L195%20182%20L208%20186%20L216%20194%20L234%20195%20L245%20179%20L245%20171%20L229%20170%20L208%20154%20L204%20153Z%20M165%20155%20L162%20158%20L163%20161%20L170%20163%20L172%20158%20L166%20154Z%20M562%20159%20L553%20168%20L550%20178%20L559%20188%20L578%20202%20L582%20204%20L594%20191%20L589%20181%20L587%20170%20L579%20160%20L564%20159Z%20M70%20190%20L60%20194%20L57%20199%20L58%20203%20L78%20222%20L89%20225%20L99%20216%20L103%20206%20L102%20200%20L99%20196%20L85%20191%20L71%20190Z%20M252%20201%20L247%20205%20L247%20208%20L249%20208%20L254%20201Z%20M256%20221%20L255%20224%20L259%20226%20L260%20222%20L258%20221Z%20M368%20224%20L358%20229%20L361%20234%20L365%20234%20L368%20231%20L368%20224Z%20M515%20227%20L506%20235%20L507%20250%20L521%20262%20L528%20273%20L536%20281%20L542%20296%20L548%20298%20L579%20295%20L583%20291%20L585%20286%20L584%20276%20L581%20272%20L576%20268%20L566%20269%20L560%20266%20L552%20250%20L534%20239%20L526%20228%20L516%20227Z%20M181%20247%20L174%20252%20L165%20270%20L172%20274%20L185%20275%20L190%20279%20L196%20290%20L201%20291%20L208%20284%20L213%20266%20L189%20248%20L182%20247Z%20M34%20259%20L33%20261%20L36%20263%20L38%20261%20L35%20259Z%20M449%20261%20L440%20264%20L437%20269%20L446%20278%20L456%20282%20L470%20272%20L472%20268%20L466%20263%20L450%20261Z%20M102%20276%20L90%20282%20L88%20288%20L94%20294%20L106%20293%20L110%20290%20L110%20284%20L108%20276%20L104%20275Z%20M171%20306%20L166%20309%20L164%20319%20L170%20330%20L175%20331%20L187%20326%20L190%20321%20L187%20315%20L181%20309%20L172%20306Z%20M329%20313%20L321%20317%20L318%20324%20L324%20329%20L333%20329%20L339%20326%20L339%20321%20L336%20314%20L330%20313Z%20M475%20-15%20L481%20-4%20L492%20-3%20L499%20-5%20L506%20-15Z%20M654%2041%20L650%2049%20L641%2056%20L639%2062%20L644%2069%20L654%2071Z%20M654%20168%20L640%20182%20L637%20189%20L640%20216%20L654%20224Z%20M394%20336%20L404%20330%20L414%20329%20L419%20331%20L423%20336Z%20M478%20336%20L476%20321%20L480%20319%20L491%20321%20L518%20321%20L525%20329%20L516%20336Z%20M361%20-5%20L335%209%20L319%2029%20L318%2031%20L321%2035%20L336%2041%20L351%2036%20L363%2018%20L365%20-4%20L362%20-5Z%20M591%2014%20L576%2026%20L573%2048%20L565%2060%20L556%2069%20L556%2072%20L561%2075%20L576%2076%20L595%2060%20L592%2015Z%20M14%2018%20L15%2032%20L26%2047%20L31%2048%20L35%2040%20L34%2035%20L30%2030%20L22%2026%20L15%2018Z%20M290%2021%20L284%2030%20L286%2032%20L290%2032%20L294%2028%20L294%2022%20L291%2021Z%20M109%2037%20L80%2066%20L75%2066%20L65%2060%20L50%2060%20L44%2062%20L42%2068%20L44%2076%20L48%2080%20L75%2083%20L91%2079%20L104%2087%20L111%2086%20L115%2085%20L112%2079%20L115%2065%20L113%2041%20L110%2036Z%20M428%2045%20L424%2048%20L429%2051%20L432%2048%20L429%2045Z%20M222%2061%20L222%2066%20L225%2067%20L226%2062%20L224%2060Z%20M462%2068%20L459%2072%20L452%2096%20L436%20122%20L437%20138%20L449%20144%20L454%20139%20L459%20124%20L489%20130%20L494%20126%20L499%20118%20L498%20105%20L491%2099%20L470%2070%20L464%2068Z%20M538%2079%20L529%2082%20L528%2089%20L531%2094%20L539%2097%20L557%2092%20L552%2085%20L539%2079Z%20M332%20155%20L319%20163%20L313%20171%20L318%20179%20L329%20184%20L340%20175%20L339%20159%20L334%20155Z%20M204%20157%20L193%20165%20L195%20176%20L199%20181%20L211%20184%20L215%20190%20L220%20192%20L232%20185%20L237%20178%20L225%20173%20L217%20164%20L205%20157Z%20M560%20163%20L554%20169%20L554%20176%20L561%20187%20L578%20200%20L582%20201%20L590%20191%20L584%20169%20L578%20163%20L561%20163Z%20M0%20182%20L-5%20185%20L-4%20189%20L6%20193%20L12%20191%20L12%20189%20L1%20182Z%20M68%20192%20L61%20196%20L61%20202%20L72%20213%20L88%20222%20L91%20220%20L99%20209%20L99%20200%20L89%20195%20L69%20192Z%20M516%20230%20L510%20236%20L510%20250%20L522%20260%20L531%20274%20L542%20279%20L547%20266%20L552%20261%20L551%20258%20L541%20247%20L531%20241%20L524%20230%20L518%20230Z%20M182%20252%20L179%20258%20L180%20266%20L192%20276%20L198%20285%20L202%20286%20L207%20281%20L210%20268%20L188%20252%20L184%20252Z%20M451%20264%20L443%20268%20L446%20274%20L451%20276%20L464%20269%20L452%20264Z%20M556%20271%20L544%20282%20L544%20291%20L549%20294%20L576%20293%20L582%20289%20L582%20279%20L579%20273%20L558%20271Z%20M104%20280%20L93%20285%20L93%20289%20L96%20291%20L103%20291%20L107%20289%20L107%20282%20L104%20280Z%20M264%20297%20L260%20306%20L265%20325%20L286%20334%20L298%20333%20L308%20322%20L303%20311%20L294%20303%20L275%20297%20L265%20297Z%20M176%20312%20L170%20319%20L171%20325%20L174%20328%20L181%20326%20L185%20321%20L184%20316%20L177%20312Z%20M477%20-15%20L485%20-8%20L491%20-6%20L498%20-8%20L503%20-15Z%20M654%2047%20L643%2061%20L646%2066%20L654%2068Z%20M654%20173%20L642%20183%20L640%20189%20L642%20199%20L641%20215%20L646%20219%20L654%20221Z%20M481%20336%20L482%20324%20L512%20322%20L518%20324%20L520%20329%20L511%20336Z%20M352%204%20L335%2013%20L323%2029%20L323%2032%20L328%2036%20L339%2038%20L351%2032%20L361%2015%20L359%205%20L354%203Z%20M585%2023%20L577%2029%20L576%2046%20L563%2069%20L565%2071%20L574%2073%20L592%2058%20L590%2026%20L586%2023Z%20M22%2033%20L22%2038%20L28%2039%20L29%2035%20L24%2033Z%20M106%2043%20L95%2054%20L87%2066%20L87%2070%20L94%2072%20L101%2080%20L112%2066%20L108%2043Z%20M48%2063%20L45%2069%20L48%2076%20L81%2079%20L84%2076%20L82%2073%20L75%2073%20L65%2065%20L49%2063Z%20M466%2076%20L458%2088%20L455%2099%20L447%20106%20L439%20124%20L440%20136%20L448%20140%20L452%20135%20L452%20121%20L460%20115%20L465%20115%20L472%20123%20L488%20127%20L491%20125%20L496%20116%20L496%20106%20L488%2099%20L481%2086%20L468%2075Z%20M536%2082%20L532%2084%20L532%2088%20L539%2092%20L544%2086%20L541%2082%20L538%2082Z%20M331%20160%20L320%20165%20L316%20170%20L319%20176%20L328%20180%20L332%20175%20L336%20165%20L335%20160%20L332%20159Z%20M206%20161%20L200%20164%20L196%20170%20L199%20177%20L205%20180%20L215%20179%20L217%20176%20L215%20166%20L207%20161Z%20M560%20166%20L556%20172%20L562%20184%20L581%20198%20L586%20191%20L581%20170%20L576%20166%20L561%20165Z%20M219%20181%20L219%20185%20L222%20185%20L224%20182%20L220%20180Z%20M68%20195%20L63%20198%20L64%20202%20L75%20211%20L86%20215%20L95%20209%20L95%20201%20L90%20198%20L69%20195Z%20M520%20235%20L513%20241%20L512%20249%20L527%20260%20L531%20269%20L536%20273%20L540%20270%20L540%20252%20L520%20235Z%20M186%20261%20L186%20264%20L202%20280%20L206%20273%20L206%20269%20L188%20260Z%20M571%20276%20L558%20277%20L551%20288%20L576%20290%20L580%20286%20L580%20279%20L578%20276%20L572%20276Z%20M268%20300%20L264%20302%20L262%20306%20L267%20321%20L284%20331%20L290%20332%20L298%20331%20L304%20325%20L306%20320%20L304%20315%20L294%20306%20L269%20300Z%20M481%20-15%20L491%20-9%20L496%20-10%20L500%20-15Z%20M654%20190%20L652%20184%20L650%20183%20L645%20184%20L643%20189%20L644%20214%20L649%20217%20L654%20217Z%20M484%20336%20L488%20328%20L504%20325%20L513%20328%20L506%20336Z%20M352%207%20L336%2015%20L329%2022%20L326%2031%20L335%2036%20L351%2028%20L357%2014%20L356%209%20L354%207Z%20M582%2029%20L579%2033%20L578%2048%20L570%2061%20L570%2066%20L574%2068%20L582%2064%20L589%2055%20L589%2039%20L584%2028Z%20M101%2055%20L96%2059%20L95%2064%20L100%2070%20L105%2070%20L108%2064%20L102%2054Z%20M50%2067%20L48%2070%20L51%2072%20L56%2070%20L51%2067Z%20M469%2082%20L463%2088%20L457%20101%20L450%20109%20L450%20112%20L452%20114%20L460%20110%20L465%20110%20L474%20120%20L486%20123%20L492%20115%20L493%20108%20L484%20100%20L479%2088%20L470%2082Z%20M444%20125%20L442%20131%20L446%20135%20L449%20129%20L445%20124Z%20M205%20165%20L200%20171%20L202%20175%20L208%20176%20L211%20174%20L212%20170%20L210%20166%20L206%20165Z%20M322%20167%20L320%20171%20L325%20174%20L327%20169%20L324%20167Z%20M561%20169%20L560%20172%20L565%20184%20L580%20193%20L581%20188%20L579%20171%20L562%20168Z%20M74%20202%20L78%20206%20L89%20207%20L91%20205%20L90%20202%20L75%20202Z%20M521%20242%20L517%20245%20L516%20248%20L525%20253%20L528%20249%20L522%20242Z%20M574%20280%20L567%20284%20L572%20286%20L576%20284%20L575%20280Z%20M274%20305%20L267%20309%20L270%20319%20L284%20329%20L292%20330%20L302%20324%20L301%20316%20L290%20307%20L275%20305Z%20M489%20336%20L491%20330%20L500%20328%20L505%20330%20L500%20336Z%20M348%2015%20L336%2019%20L331%2024%20L330%2031%20L336%2032%20L348%2025%20L351%2018%20L349%2014Z%20M581%2051%20L574%2059%20L576%2062%20L580%2061%20L584%2055%20L582%2050Z%20M469%2087%20L464%2094%20L463%20102%20L475%20116%20L484%20117%20L488%20114%20L489%20109%20L480%20102%20L476%2089%20L470%2087Z%20M568%20172%20L565%20175%20L567%20181%20L575%20185%20L577%20175%20L574%20172%20L569%20172Z%20M649%20196%20L650%20204%20L652%20199%20L650%20195Z%20M278%20307%20L272%20311%20L273%20316%20L284%20327%20L292%20328%20L299%20322%20L298%20316%20L288%20309%20L279%20307Z%20M338%2023%20L335%2026%20L337%2028%20L341%2025%20L339%2023Z%20M469%2093%20L467%20100%20L472%20102%20L474%2096%20L470%2093Z%20M281%20311%20L278%20314%20L280%20319%20L290%20325%20L294%20322%20L293%20318%20L282%20311Z%27%2F%3E%3C%2Fsvg%3E\")";

    function MiniGameLauncher(props) {
      const t = props.t;
      const useStatus = props.useSessionStatus || useNoStatus;
      const signal = String(useStatus(sessionSignal));
      const split = signal.split('|');
      const running = split[0] === 'true';
      const pending = split[1] || '';

      const [open, setOpen] = useState(false);
      const [shown, setShown] = useState(false);
      const [closing, setClosing] = useState(false);
      const [settings, setSettings] = useState(false);
      const [theme, setTheme] = useState(mgThemeRead);
      const closeTimer = useRef(0);
      const [gameId, setGameId] = useState(null);
      const [paused, setPaused] = useState(false);
      const [pauseReason, setPauseReason] = useState('');
      const [boost, setBoost] = useState(false);
      const [extraTick, setExtraTick] = useState(0);
      const [restartTick, setRestartTick] = useState(0);
      const [frameOverride, setFrameOverride] = useState(null);
      const [note, setNote] = useState('');

      const rootRef = useRef(null);
      const buttonRef = useRef(null);
      const wasRunning = useRef(running);

      const game = gameId ? GAMES.filter((item) => item.id === gameId)[0] || null : null;
      const frame = game
        ? (game.Game && frameOverride ? frameOverride : gameFrame(game))
        : (settings ? SETTINGS_FRAME : MENU);
      const inGame = Boolean(game);
      const consoleMode = open && inGame;
      const saveTheme = (patch) => {
        setTheme((prev) => {
          const next = Object.assign({}, prev, patch);
          mgThemeWrite(next);
          return next;
        });
      };
      const singleGradient = (color) => {
        const dark = mgLum(color) < 0.03;
        return 'linear-gradient(90deg,' + (dark ? color : '#000000') + ',' + (dark ? '#3f4750' : color) + ')';
      };
      const dockFrom = theme.advanced ? theme.from : theme.theme;
      const dockTo = theme.advanced ? theme.to : '#3f4750';
      const solidDock = !theme.advanced && theme.solid;
      const dockBg = solidDock
        ? theme.theme
        : (theme.advanced ? 'linear-gradient(90deg,' + theme.from + ',' + theme.to + ')' : singleGradient(theme.theme));
      const dockFg = mgOnColor(dockFrom);

      /* Turn start pops the menu open; turn end pauses whatever game is open. */
      useEffect(() => {
        const was = wasRunning.current;
        wasRunning.current = running;
        if (!was && running && !gameId) setOpen(true);
        if (was && !running && gameId) {
          setPaused(true);
          setPauseReason('done');
        }
      }, [running, gameId]);

      /* An approval, plan review or question freezes the game until the user
       * resumes it from the console. */
      useEffect(() => {
        if (pending && gameId) {
          setPaused(true);
          setPauseReason(pending);
        }
      }, [pending, gameId]);

      /* The panel mounts hidden and flips visible two frames later so the
       * entrance transition is not coalesced into the first paint. */
      useEffect(() => {
        if (!open) {
          setShown(false);
          return undefined;
        }
        let inner = 0;
        const outer = requestAnimationFrame(() => {
          inner = requestAnimationFrame(() => setShown(true));
        });
        return () => {
          cancelAnimationFrame(outer);
          cancelAnimationFrame(inner);
        };
      }, [open]);

      useEffect(() => {
        if (!note) return undefined;
        const id = setTimeout(() => setNote(''), 1600);
        return () => clearTimeout(id);
      }, [note]);

      const closePanel = useCallback((restoreFocus) => {
        if (!open || closing) return;
        setClosing(true);
        setShown(false);
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => {
          setOpen(false);
          setClosing(false);
          if (gameId) {
            setPaused(true);
            setPauseReason('hidden');
          }
          if (restoreFocus && buttonRef.current) buttonRef.current.focus();
        }, 320);
      }, [open, closing, gameId]);

      useEffect(() => () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
      }, []);

      useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
          const root = rootRef.current;
          const target = event.target;
          if (root && target && root.contains(target)) return;
          closePanel(false);
        };
        const onKeyDown = (event) => {
          if (event.key === 'Escape') closePanel(!gameId);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown);
        };
      }, [open, gameId, closePanel]);

      /* Arrow keys walk the 3x3 shelf; Enter still opens the focused game. */
      const onGridKeyDown = (event) => {
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.key];
        const jump = event.key === 'Home' ? 'first' : (event.key === 'End' ? 'last' : null);
        if (step === undefined && !jump) return;
        const cards = Array.prototype.slice.call(event.currentTarget.querySelectorAll('.mg-card'));
        const current = event.target && typeof event.target.closest === 'function'
          ? event.target.closest('.mg-card')
          : event.target;
        const index = cards.indexOf(current);
        if (index < 0) return;
        const next = jump
          ? (jump === 'first' ? 0 : cards.length - 1)
          : index + step;
        if (next < 0 || next >= cards.length) return;
        event.preventDefault();
        const node = cards[next];
        if (node && typeof node.focus === 'function') node.focus();
      };

      const toggleOpen = useCallback(() => {
        if (open) closePanel(false);
        else setOpen(true);
      }, [open, closePanel]);

      const enterGame = useCallback((id) => {
        setSettings(false);
        setGameId(id);
        setPaused(false);
        setPauseReason('');
        setBoost(false);
        setFrameOverride(id === 'mines' ? minesFrame(minesSize(readMinesSettings().size)) : null);
        setNote('');
      }, []);

      const backToMenu = useCallback(() => {
        setGameId(null);
        setPaused(false);
        setPauseReason('');
        setBoost(false);
        setFrameOverride(null);
        setNote('');
      }, []);

      const togglePause = useCallback(() => {
        if (paused) {
          setPaused(false);
          setPauseReason('');
        } else {
          setPaused(true);
          setPauseReason('manual');
        }
      }, [paused]);

      const runExtra = useCallback(() => {
        if (!game) return;
        if (game.action === 'boost') {
          setBoost((value) => !value);
          return;
        }
        if (game.action === 'restart' || game.action === 'pass' || game.action === 'rotate' || game.action === 'hint' || game.action === 'serve') {
          setExtraTick((value) => value + 1);
          return;
        }
        setNote(t('triggered') + ' · ' + t(game.extra));
      }, [game, t]);

      /* P and Space both toggle pause in every game, whatever has focus. */
      useEffect(() => {
        if (!open || !gameId) return undefined;
        const onKeyDown = (event) => {
          const target = event.target;
          if (target && typeof target.closest === 'function'
            && target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
          if (event.key === 'p' || event.key === 'P') {
            event.preventDefault();
            togglePause();
            return;
          }
          if (event.key === ' ') {
            event.preventDefault();
            togglePause();
          }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
      }, [open, gameId, togglePause]);

      return h('div', { className: 'mg-root', ref: rootRef },
        h('style', null, CSS),
        h('section', {
          className: 'mg-panel',
          'data-open': open ? 'true' : 'false',
          'data-shown': shown ? 'true' : 'false',
          'aria-hidden': open ? 'false' : 'true',
          inert: open ? undefined : '',
          role: 'dialog',
          'aria-label': inGame ? t(game.id) : (settings ? t('settingsTitle') : t('title')),
          style: { width: frame.w + 'px', height: frame.h + 'px', '--mg-accent': theme.theme, '--mg-on-accent': mgOnColor(theme.theme) },
        },
            h('div', {
              className: 'mg-view mg-menu',
              'data-active': !inGame && !settings ? 'true' : 'false',
              'aria-hidden': !inGame && !settings ? 'false' : 'true',
              inert: !inGame && !settings ? undefined : '',
            },
              h('div', { className: 'mg-menu-inner' },
                h('header', { className: 'mg-head' },
                  h('div', { className: 'mg-head-main' },
                    h('div', { className: 'mg-kicker-row' },
                      h('span', { className: 'mg-kicker' }, 'DSH // ARCADE'),
                      h('span', { className: 'mg-kicker-rule', 'aria-hidden': 'true' }),
                    ),
                    h('h2', { className: 'mg-title' }, t('title')),
                    h('p', { className: 'mg-sub' },
                      running
                        ? h('span', { className: 'mg-wait' },
                          h('span', { className: 'mg-dot', 'aria-hidden': 'true' }),
                          t('waiting'))
                        : t('subtitle'),
                    ),
                  ),
                  h('button', {
                    type: 'button',
                    className: 'mg-close',
                    'aria-label': t('settingsTitle'),
                    title: t('settingsTitle'),
                    onClick: () => setSettings(true),
                  },
                    h(SettingsGlyph, { size: 20 }),
                  ),
                ),
                h('div', { className: 'mg-grid', onKeyDown: onGridKeyDown },
                  GAMES.map((item, index) => h('button', {
                    key: item.id,
                    type: 'button',
                    className: 'mg-card',
                    title: t(item.id),
                    style: { '--mg-delay': (40 + index * 24) + 'ms' },
                    onClick: () => enterGame(item.id),
                  },
                    h('span', { className: 'mg-index' }, ('0' + (index + 1)).slice(-2)),
                    h('span', { className: 'mg-card-main' },
                      h('span', { className: 'mg-icon', 'aria-hidden': 'true' }, h(item.Icon)),
                      h('span', { className: 'mg-name' }, t(item.id)),
                    ),
                  )),
                ),
                h('div', { className: 'mg-foot' },
                  h('span', null, 'P PAUSE'),
                  h('span', null, 'ESC CLOSE'),
                  h('span', null, ('0' + GAMES.length).slice(-2) + ' MODULES'),
                ),
              ),
            ),
            h('div', {
              className: 'mg-view mg-settings',
              'data-active': settings && !inGame ? 'true' : 'false',
              'aria-hidden': settings && !inGame ? 'false' : 'true',
              inert: settings && !inGame ? undefined : '',
            },
              h('div', { className: 'mg-set-inner' },
                h('header', { className: 'mg-set-head' },
                  h('button', {
                    type: 'button', className: 'mg-set-back', 'aria-label': t('back'),
                    onClick: () => setSettings(false),
                  }, h(BackGlyph, { size: 14 })),
                  h('h2', { className: 'mg-set-title' }, t('settingsTitle')),
                  h('span', { className: 'mg-set-kicker' }, 'THEME'),
                ),
                h('div', { className: 'mg-prev' },
                  h('div', {
                    className: 'mg-prev-plate mg-tex-host',
                    'data-texture': theme.texture,
                    style: {
                      background: dockBg, color: dockFg, '--mg-tex': theme.texColor, '--mg-contour': MG_CONTOUR,
                    },
                  },
                    h('span', { className: 'mg-tx-wrap', 'aria-hidden': 'true' },
                      h('span', { className: 'mg-tx' }),
                    ),
                    h('span', { className: 'mg-prev-hud', 'aria-hidden': 'true' },
                      h('span', { className: 'mg-prev-btn' }, h(BackGlyph)),
                      h('span', { className: 'mg-prev-btn' }, h(PauseGlyph, { size: 15 })),
                      h('span', { className: 'mg-prev-btn' }, h(RestartGlyph, { size: 14 })),
                      h('span', { className: 'mg-spacer' }),
                      h('span', { className: 'mg-prev-btn' }, h(CloseGlyph, { size: 14 })),
                    ),
                  ),
                  h('div', { className: 'mg-prev-cap' },
                    h('span', { className: 'mg-live' }, t('livePreview')),
                    h('span', { className: 'mg-prev-hex' },
                      theme.solid ? theme.theme.toUpperCase() : dockFrom.toUpperCase() + ' \u2192 ' + dockTo.toUpperCase()),
                  ),
                ),
                h('div', { className: 'mg-set-body' },
                  h('section', { className: 'mg-set-sec' },
                    mgSectionHead('01', t('themeColor'), theme.theme.toUpperCase()),
                    h('div', { className: 'mg-swatches' },
                      THEME_PRESETS.map((color) => h('button', {
                        key: color,
                        type: 'button',
                        className: 'mg-swatch' + (theme.theme === color ? ' mg-swatch-on' : ''),
                        style: { background: color },
                        'aria-label': color,
                        'aria-pressed': theme.theme === color ? 'true' : 'false',
                        onClick: () => saveTheme({ theme: color }),
                      },
                        theme.theme === color
                          ? h('span', {
                            className: 'mg-swatch-tick',
                            style: { color: mgOnColor(color) },
                          }, h(CheckGlyph, { size: 12 }))
                          : null,
                      )),
                    ),
                    h('div', { className: 'mg-set-row' },
                      h('div', { className: 'mg-set-row-main' },
                        h('span', { className: 'mg-set-row-label' }, t('custom')),
                      ),
                      h('label', { className: 'mg-well' },
                        h('input', {
                          type: 'color', value: theme.theme, 'aria-label': t('custom'),
                          onChange: (event) => saveTheme({ theme: event.target.value }),
                        }),
                        h('span', { className: 'mg-well-text' }, theme.theme.toUpperCase()),
                      ),
                    ),
                    h('div', { className: 'mg-set-row' },
                      h('div', { className: 'mg-set-row-main' },
                        h('span', { className: 'mg-set-row-label' }, t('solid')),
                        h('span', { className: 'mg-set-row-hint' }, t('solidHint')),
                      ),
                      h(MgSwitch, {
                        checked: theme.solid, label: t('solid'),
                        onChange: (value) => saveTheme({ solid: value }),
                      }),
                    ),
                  ),
                  h('section', { className: 'mg-set-sec' },
                    mgSectionHead('02', t('gradient'), theme.advanced ? 'CUSTOM' : 'AUTO'),
                    h('div', { className: 'mg-set-row' },
                      h('div', { className: 'mg-set-row-main' },
                        h('span', { className: 'mg-set-row-label' }, t('advanced')),
                        h('span', { className: 'mg-set-row-hint' }, t('advancedHint')),
                      ),
                      h(MgSwitch, {
                        checked: theme.advanced, label: t('advanced'),
                        onChange: (value) => saveTheme({ advanced: value }),
                      }),
                    ),
                    theme.advanced
                      ? h(React.Fragment, null,
                        h('div', { className: 'mg-grads' },
                          GRADIENT_PRESETS.map((pair) => h('button', {
                            key: pair[0] + pair[1],
                            type: 'button',
                            className: 'mg-grad' + (theme.from === pair[0] && theme.to === pair[1] ? ' mg-grad-on' : ''),
                            style: { background: 'linear-gradient(135deg,' + pair[0] + ',' + pair[1] + ')' },
                            'aria-label': pair.join(' '),
                            onClick: () => saveTheme({ advanced: true, from: pair[0], to: pair[1] }),
                          })),
                        ),
                        h('div', { className: 'mg-set-colors' },
                          h('label', { className: 'mg-well' },
                            h('input', {
                              type: 'color', value: theme.from, 'aria-label': t('gradientStart'),
                              onChange: (event) => saveTheme({ from: event.target.value }),
                            }),
                            h('span', { className: 'mg-well-text' }, t('gradientStart')),
                          ),
                          h('label', { className: 'mg-well' },
                            h('input', {
                              type: 'color', value: theme.to, 'aria-label': t('gradientEnd'),
                              onChange: (event) => saveTheme({ to: event.target.value }),
                            }),
                            h('span', { className: 'mg-well-text' }, t('gradientEnd')),
                          ),
                        ),
                      )
                      : h('div', { className: 'mg-auto' },
                        h('span', { className: 'mg-auto-chip', style: { background: singleGradient(theme.theme) } }),
                        h('span', null, t('gradientHint')),
                      ),
                  ),
                  h('section', { className: 'mg-set-sec' },
                    mgSectionHead('03', t('texture'), t(TEX_KEYS[theme.texture])),
                    h('div', { className: 'mg-texs' },
                      THEME_TEXTURES.map((id) => h('button', {
                        key: id,
                        type: 'button',
                        className: 'mg-tex',
                        'aria-pressed': theme.texture === id ? 'true' : 'false',
                        'aria-label': t(TEX_KEYS[id]),
                        onClick: () => saveTheme({ texture: id }),
                      },
                        h('span', {
                          className: 'mg-tex-tile mg-tex-host',
                          'data-texture': id,
                          style: { background: dockBg, '--mg-tex': theme.texColor, '--mg-contour': MG_CONTOUR },
                        },
                          h('span', { className: 'mg-tx-wrap', 'aria-hidden': 'true' },
                            h('span', { className: 'mg-tx' }),
                          ),
                        ),
                        h('span', { className: 'mg-tex-name' }, t(TEX_KEYS[id])),
                      )),
                    ),
                    theme.texture !== 'none'
                      ? h('div', { className: 'mg-set-row' },
                        h('div', { className: 'mg-set-row-main' },
                          h('span', { className: 'mg-set-row-label' }, t('textureColor')),
                        ),
                        h('label', { className: 'mg-well' },
                          h('input', {
                            type: 'color', value: theme.texColor, 'aria-label': t('textureColor'),
                            onChange: (event) => saveTheme({ texColor: event.target.value }),
                          }),
                          h('span', { className: 'mg-well-text' }, theme.texColor.toUpperCase()),
                        ),
                      )
                      : null,
                  ),
                  h('button', {
                    type: 'button', className: 'mg-set-reset',
                    onClick: () => {
                      mgThemeWrite(THEME_DEFAULTS);
                      setTheme(Object.assign({}, THEME_DEFAULTS));
                    },
                  }, h(RestartGlyph, { size: 13 }), t('resetTheme')),
                ),
              ),
            ),
            h('div', {
              className: 'mg-view mg-game',
              'data-active': inGame ? 'true' : 'false',
              'aria-hidden': inGame ? 'false' : 'true',
              inert: inGame ? undefined : '',
            },
              inGame
                ? h(GameStage, {
                  t, game, active: open, extraTick, restartTick, running, pending, paused, pauseReason, boost, note, onFrame: setFrameOverride, onTogglePause: togglePause,
                })
                : null,
            ),
        ),
        h('div', {
          className: 'mg-dock mg-tex-host',
          'data-mode': closing ? 'menu' : (consoleMode ? 'game' : 'menu'),
          'data-texture': theme.texture,
          style: {
            width: closing ? '50px' : (consoleMode ? frame.w + 'px' : '50px'),
            background: dockBg,
            color: dockFg,
            '--mg-tex': theme.texColor,
            '--mg-contour': MG_CONTOUR,
          },
        },
          h('span', { className: 'mg-tx-wrap', 'aria-hidden': 'true' },
            h('span', { className: 'mg-tx' }),
          ),
          h('button', {
            ref: buttonRef,
            type: 'button',
            className: 'mg-launch',
            'aria-haspopup': 'dialog',
            'aria-expanded': open ? 'true' : 'false',
            'aria-label': open ? t('close') : t('open'),
            title: t('title'),
            onClick: toggleOpen,
            tabIndex: consoleMode ? -1 : 0,
          },
            h('span', { className: 'mg-glyph', 'data-state': open && !closing ? 'off' : 'on' },
              h(GamepadGlyph, { size: 22 })),
            h('span', { className: 'mg-glyph', 'data-state': open && !closing ? 'on' : 'off' },
              h(CloseGlyph, { size: 20 })),
          ),
          h('div', {
            className: 'mg-console',
            'aria-hidden': consoleMode ? 'false' : 'true',
            inert: consoleMode ? undefined : '',
          },
            h('button', {
              type: 'button', className: 'mg-cbtn', title: t('back'), 'aria-label': t('back'),
              onClick: backToMenu,
            }, h(BackGlyph)),
            h('button', {
              type: 'button', className: 'mg-cbtn',
              title: paused ? t('resume') : t('pause'),
              'aria-label': paused ? t('resume') : t('pause'),
              'aria-pressed': paused ? 'true' : 'false',
              onClick: togglePause,
            }, paused ? h(PlayGlyph, { size: 17 }) : h(PauseGlyph, { size: 17 })),
            game && game.Game
              ? h('button', {
                type: 'button', className: 'mg-cbtn',
                title: t('restart'), 'aria-label': t('restart'),
                onClick: () => setRestartTick((value) => value + 1),
              }, h(RestartGlyph, { size: 16 }))
              : null,
            h('span', { className: 'mg-spacer' }),
            game && game.extra
              ? h('button', {
                type: 'button', className: 'mg-caction',
                title: t(game.extra),
                'aria-pressed': game.action === 'boost' ? (boost ? 'true' : 'false') : undefined,
                onClick: runExtra,
              }, t(game.extra))
              : null,
            h('span', { className: 'mg-csep', 'aria-hidden': 'true' }),
            h('button', {
              type: 'button', className: 'mg-cbtn', title: t('close'), 'aria-label': t('close'),
              onClick: () => closePanel(false),
            }, h(CloseGlyph, { size: 16 })),
          ),
        ),
      );
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'minigame-list: dictionaries');
      const t = ctx.locale.bind(NS);
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'minigame-launcher',
        order: 900,
      }, (props) => h(MiniGameLauncher, Object.assign({}, props, { t }))));
    }

    return { inject: ['slots', 'locale'], apply };
  },
});
