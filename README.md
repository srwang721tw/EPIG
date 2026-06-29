# 🐷 EPIG — 豬豬養成遊戲

A cozy pig farming game playable in your browser. Works on desktop and mobile (iPhone 13) as a PWA.

## Play

**GitHub Pages:** https://srwang721tw.github.io/EPIG/

Or run locally:
```bash
npx serve .
```

## Features

- **12 pig breeds** from Common to Legendary, each with unique abilities (自動清潔豬舍、好感度光環、死亡復活、龍豬會飛…)
- **9 feed types** from 廚餘 to 神仙佛跳牆
- **7 pen tiers** from 路邊廢棄豬圈 to 外太空豬站
- **Gacha system** with pity (保底) for pigs, feed, pens, and disaster items
- **Real-time mechanics** — state advances even when the tab is closed
- **8 random events**: 口蹄疫、颱風、地震、大野狼、大旱、市場崩盤、農業博覽會、美食節
- **Breeding** — male + female pigs produce random-rarity piglets
- **PWA** — add to home screen on iPhone for full-screen play

## Tech

Pure HTML/CSS/Vanilla JavaScript (ES Modules). No framework, no build step. Saves to `localStorage`.

## License

MIT
