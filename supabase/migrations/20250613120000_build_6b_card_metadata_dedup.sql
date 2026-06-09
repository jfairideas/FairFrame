-- Build 6B fix: idempotent press card metadata per analysis

delete from public.fair_cards
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by user_id, analysis_id, card_type
        order by created_at asc
      ) as rn
    from public.fair_cards
    where analysis_id is not null
      and card_type = 'press'
  ) ranked
  where rn > 1
);

create unique index if not exists fair_cards_user_analysis_press_unique
  on public.fair_cards (user_id, analysis_id, card_type)
  where analysis_id is not null and card_type = 'press';
