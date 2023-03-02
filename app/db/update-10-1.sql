alter table collection
    add proposal_num int default 0 not null;

update collection c left join (select collection_id, count(*) as proposal_num
                               from platwin_v2.proposal
                               group by collection_id) p on c.collection_id = p.collection_id
set c.proposal_num=p.proposal_num
where c.collection_id = p.collection_id;