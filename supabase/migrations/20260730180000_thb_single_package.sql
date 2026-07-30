-- Switch to a single THB package
--
-- Card and PromptPay only, one package, one token per purchase. PromptPay
-- requires a THB-denominated Checkout Session, so the package price moves
-- from EUR to THB. The old five-token pack is hidden rather than deleted —
-- ct_tokens.package_id already on delete set null, so nothing breaks if an
-- admin reactivates it later.

update public.ct_packages
   set price_cents = 169900,
       currency = 'THB',
       description = 'One testing token for one app.',
       sort_order = 1
 where name = 'Single App';

update public.ct_packages
   set is_active = false
 where name = 'Studio Pack';
