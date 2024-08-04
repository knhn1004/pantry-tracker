begin;


create policy "Allow users to select their own data" on storage.objects  for
select 
to authenticated
  using (
    requesting_user_id() = owner_id
  );

create policy "Allow users to insert their own data" on storage.objects for insert
to authenticated
with
  check (
    requesting_user_id() = owner_id
  );


commit;