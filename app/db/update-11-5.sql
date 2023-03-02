alter table collection
    add weight int default 0 not null;

update collection
set weight=1
where collection_name in
      ('Bowling DAO', 'Sportscard DAO', 'vintagecarsDAO', 'Bookclub DAO', 'ShoeSwapDAO', 'Oceancleanup DAO', 'ZenoDAO',
       'SimplyYoga',
       'MetaProp3rty', 'Metacubics', 'Dazefy', 'Evently', 'NFTlayaway', 'Singerzdao', 'AlikaDAO', 'DerivativesDAO',
       'SBLoansDAO',
       'ArbitrageDAO');

UPDATE collection
SET collection_name = 'Optizone',
    dao_name        = 'Optizone'
WHERE collection_id = 'opzitone';

create table temp
(
    collection_name varchar(60)  null,
    tags            varchar(120) null
);
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Bowling DAO', 'Social inclusion/competitive/community');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Sportscard DAO', 'sports card collection/investment/trading');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Bookclub DAO', 'Hobby/Book enthusiast/group activity ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('vintagecarsDAO', 'Collector DAO/automotive enthusiast');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('ShoeSwapDAO', 'Shoe Investment,trading platform/media platform');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Addicts DAO', 'Recovery/Social reachout/Suuport DAO');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Oceancleanup DAO', 'Project/DAO cleanup/Service');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Stopgunviolence DAO', 'Violence awareness/social safety/');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Neighbor watch', 'Safety protocol/Community security ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('ZenoDAO ', 'Investment platform/Project fund/contribution');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('FitnessDAO', 'Fitness community/health awareness/support group/body investment');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('SImplyYoga', 'Yoga community/body investment/excersise');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('CappDAO', 'Hat collection/Community inclusion/Hobby ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('BringTheHeat', 'Foodie');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Gogreen DAO', 'Charity/Community Help/Service');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Fooddrive DAO', 'Foodie/Charity/Social inclusion');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('PastelDAO', 'NFT art investment/Creative hub');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('BikerzDAO', 'Automotive group');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('WeatherDAO', 'weather protocol/media system');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Metaball DAO', 'Web3 gaming/play to earn/metaverse');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Metacubics', 'Metaverse/community meeting hub');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Dazefy', 'Yield farming protocol');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Sotrade', 'Trading DAO/Trading platform');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('MetaProp3rty', 'Creative Architecture hub/NFT minting');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Evently', 'Event planning hub/social community/Entertainment');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('NFTBunk3r', 'NFT marketplace/community builder');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Markety', 'marketing project/community inclusion');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('NFTSlices', 'NFT Fractionalization');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('GamerLink_DAO', 'Web3 gaming/game organization');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('BridgePool', 'Web2 development/bridging application');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Feliner', 'Web3 application hub/creativity expression');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Friendlygrounds', 'Community gaming and cooperation');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('MintandChat', 'NFT focused app/application governance ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Autostakeme', 'Staking protocol');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('NFTLayaway', 'NFT investment/fractionalization protocol');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Analyticore', 'metaverse/digital simulation');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Upndown', 'community driven project/NFT minting');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('POAPkings', 'POAP incentivisation');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Web3Cred', 'Security DAO/safety protocol');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('AirdropME', 'Airdrop platform');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Recipro', 'DAO tooling');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Botackdao', 'Contribution,Research fund');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('hexatoon.dao', 'Collaboration DAO/Web3 organization');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('turbofi.dao', 'Automotive investors');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('jinxyz.dao', 'NFT minting/Collector DAO');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Frippy.dao', 'Artist enthusiast group/project supporter');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Optizone', 'Treatment DAO/addiction recovery/support reachout');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Contrac.dao', 'Real Estate venture DAO/contract builder/Education ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Gilly.dao', 'NFT collectors/NFT minting');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('BreakDanceDAO', 'Dance DAO/Hip hop');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Singerzdao', 'Singers DAO/culture ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('rugbydao', 'Sport enthusiast/sports community');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Surfsup', 'Hobby/Group activity/social gathering');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Oragami', 'Social artist group');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('CleanTheParks', 'Community cleanup/Social builder/Save the planet');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('ActorzUs', 'Actor DAO/social performance ');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('ClayCrafts', 'Creativity Art setting');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('AlikaDAO', 'Web3 investment project/social minority group');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('CacheUs', 'Investor group/inclusion');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('GoldenTrustDAO', 'Gold investors');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('DerivativesDAO', 'Derivative investment/knowledge awareness');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('TritonFinanceDAO', 'Financial decision maker/finance platform');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('WhyWaste', 'Service protocol/cleaning DAO/');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('TokeTough DAO', 'Tokenomics');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Mountus', 'NFT project finder/NFT awareness/');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('EliteFinanceDAO', 'Web3 investment/finance protocol');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('SculptNSip', 'Wine and art DAO/Creative community');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('SBLoansDAO', 'Loaning application/small business investors');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('ArbitrageDAO', 'arbitrage crypto investment DAO');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('MakeaWishDAO', 'Charity/Foundation support/Community fundraiser');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('WeSims DAO', 'Metaverse/Simulation gaming/Social venture');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Justwatches', 'NFT watch investment DAO/Investment group');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('FoodcartFrenzy', 'Foodie/Social gathering');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('Phaze2DAO', 'Career assistance/support group');
INSERT INTO blockchain_data.temp (collection_name, tags)
VALUES ('SuperNovaDAO', 'Galaxy enthusiast/group gathering');

update collection c, temp t
set c.tags=t.tags
where c.collection_name = t.collection_name;

drop table temp;