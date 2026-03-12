-- ネタ増殖装置 (ng_ prefix)
-- Supabaseのクエリエディタで実行してください

create table if not exists ng_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null default '',
  color text not null default '#4A6FA5',
  data jsonb not null default '{
    "強ワード": [],
    "問いの型": [],
    "コンプレックスとステータス": [],
    "場面": []
  }',
  created_at timestamptz default now()
);

create table if not exists ng_ideas (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references ng_accounts(id) on delete cascade,
  title text not null,
  category text not null default '',
  fav boolean not null default false,
  used boolean not null default false,
  created_at timestamptz default now()
);

-- サンプルアカウントを1件挿入（任意）
insert into ng_accounts (name, platform, color, data) values (
  'シアニン',
  'note / X',
  '#4A6FA5',
  '{
    "強ワード": ["要領","愛嬌","評価","信頼","説明力","魅力","地頭","言語化","要約力"],
    "問いの型": ["とは何か","がある人とない人の違い","を勘違いすると損をする","は鍛えられるのか","がない人に足りないもの"],
    "コンプレックスとステータス": ["浅く見られたくない","評価されたい","なめられたくない","好かれたい","できる人になりたい"],
    "場面": ["仕事","会議","人間関係","AI活用","発信・SNS","学習"]
  }'
);
