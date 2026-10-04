-- Seeded database of schellingboard v4.0.0, dumped by
-- scripts/dump-release-db.ts. Fixture for the release-upgrade tests.
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE "__drizzle_migrations" (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'1107df38b4290b4fe1dd281c08573221561a93785a32d0f95120bc1abb2293bb',1776427018156);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'ffba427f6f60483ba8d47ffc022d5a078e1eefa9b820e30348dd46c6ad44b0c0',1776795822236);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'356e1628cb2abed39061f9958d073374db752a99959e1c7e023f7a379ecf6340',1777365674121);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'fb0024c12ea40cacadf432c3ecf9a38f70917be2e35fb2670c72695937b5d1e8',1777369604281);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d92e421279d2ed826852535efb5075188ad8d3a95c299ed7e9369cda390c02e6',1782260306200);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'7b4b5653b9d3666e281c52a28d9aab6f81115daf5fbd2d9b6b983f1487fcfb23',1782331084625);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'be46c00b651f68f6c13cea7c8c60ba178eac563696ee4b8abc2d891461ad8656',1782396063145);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'4b28a6d190edd34912a1d2ce998419b53ffedb1a90f2e8afa83f1a3a8fcd3670',1783004074395);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'10b65f397b8eec06313e3b9ed40bb7812bfd37a2cfea5be1b6204b419b02ae07',1782451329873);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'f573093161db7ab68113a94c5ed65e33c9a8aa6142132a331ad9adee93a4ecf2',1783287753472);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'959b1b205942f98ae1430461005c5bd8ce98e8e3f38dd2336045b34b249f3b5c',1783288151579);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'f30a6e7a956bd34d19a1f85d90a90626e1ff862ac5d3505ef701a427692222f5',1783288200000);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'0a82023b26cb7e52fac9702ce1860077669bf9f2330d296716b41e354bde723d',1783662363022);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'c001b84f21fe61e440f384051526fcd33c37494d02fbb02c6e2c701b07dc9fea',1783663059092);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'e6d5910a78cc22431175bf8d68e7977a68083d224453f1c6d6aa32295957fc71',1783757368893);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'b8c8dd4789e283a3ac5b63729cb546a5f99041d27379eb9390ed5a83f46f536a',1783801789716);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d6bda58a06b8be594dbe2bf6d09b8fe7c6462ef825b87fe863b80ce4d8914cbf',1783803215955);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'47e5fe9f141fc5ec50b0c1eed84b1301663ac88753e3ec1a7225e21454baae58',1783841298927);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'06cec3b2494c8db2cf67f5745f3e59226ff7ee04364d6f6fd5c3a5212b91e104',1784110051953);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'e0d86b181f1852f4ff7d449d570e835ec6f1e38b61b627663c3c1572113e24db',1784367197755);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'bfa65f0fa84b99d4e420a90b7e5a7b54345fd871682dbdbaf5085da90ed4f286',1784389404349);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d5404cae79c27b1b45c3ac2bc0683ac8183b6506156e98174ba4ebc873ba255c',1784721166667);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'2e72787d10a9ac51c279679608dd0c47f2c5c8afadf903dc851ec421dd9a6ea1',1785244239059);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'024501d900cc0ba16b52c41d7daab9f11a2aa690acc45f455bfb149f81818188',1785333843585);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'485683124132b5fe564716885bfda1a274000782dc4d37a9bc02637e74a706b3',1785596621720);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'176bc0daad9320c72598eebe3df68b9a800cc87ccf314555508c119954244676',1786525223340);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'ec198eb263ac5e33d0ab7054a24d6ccc310b3d0d5bba60735d68d00b04d4569b',1787430579703);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'813695efdf60f109d4d3a560091317140020f9d5c9229bbefc9c9bab1df74852',1787509687748);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'62f49b6a25243ffc59663107d341c5c2c353aaabefac81911148d4c383d7468a',1788001821549);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'b6397797a064d7b0ed6c8f59b0260f37f86c8664ba6aedcadefc960b9091b4d1',1788252255683);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'78be6a433f663906a763667c1896e159cbb6f4139b5d4051d0b1c01040044881',1788252381645);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'ef4112b4e9e72685b88ecff319aa0173f9c71eceb74fdfa795575577347c9a19',1788511164512);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'170003a8bcaeedacf5c275b6359c0e03f9c95a67fc8789f90cd3f4ee52f0e1ac',1788594330660);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'6b7d1c881d1f37d657e25db1c70372cc90079560b3caf68932591a51c6544a3f',1788697709228);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'7139ed3f5528a6a1e4854bae5dea43fbbcbae2d04442898340ae50bfbbeb3951',1788703476668);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'cfc5f0194397efebdfe98f97026907d0676a7ec0cbaa80476ed3aa93a21ba9b0',1788768341579);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'1c1047c38bdc767e53901d035af1c7e181ed06ac139435c87b252d5b84d3d916',1790711821877);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'4eeb00849800f7b8ea573896a7d024891b82ab28fc1ded0139b17f35470af806',1790772955504);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'5bfd2fadea8ae67756db285e7d9ec17ce4d1d3a21e9088bb105d4a255c7910fa',1790845988082);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'03560ae0cb3cc8ff030bcd4fdb2f1a11090401f19bfb99c6133eacb1f06392d8',1790854435376);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'e62269223b9a0206f341e21604a6b388454bcd8864f63ab8ce2d90ebb1d76521',1790946961896);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'c0951197c43d79908e1d065763017f5615d149feb8b10536a45c682a4a2e784d',1790950140243);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d49c789b2129e75feac27c1b9de4b339f3a07600cb301a41c4a9fbc93f795217',1790951320917);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'70dabc01d006f4af6fc8ff8971b460db73c853fefc7fe9522938528a26114e39',1791070659547);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'5828619be497cf97a2438f064abd13cbb91561582a1f46058d065bc132f481c7',1791071000334);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'eddb61ae567a122806eaeb4c8baabffa61707d24667ff1c1c6f6e2366e5fe7c8',1791071981257);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'9bf8c948c3abead69c382d612b82c9313839ecdf296c6ded17f47ff3c8046f15',1791074146521);
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
, `about_me` text, `avatar_url` text, `pronouns` text, `email_on_rsvp_change` integer DEFAULT true NOT NULL, `email_on_host_change` integer DEFAULT true NOT NULL, `email_on_cohost_add` integer DEFAULT true NOT NULL, `based_in` text, `prompts` text, `languages` text, `contacts` text, `auth_protected` integer DEFAULT false NOT NULL, `password_hash` text, `email_on_proposal_comment` integer DEFAULT true NOT NULL, `email_on_comment_thread` integer DEFAULT false NOT NULL, `profile_updated_at` text, `email_on_session_comment` integer DEFAULT true NOT NULL, `email_on_profile_comment` integer DEFAULT true NOT NULL, `email_on_meeting_request` integer DEFAULT true NOT NULL, `email_on_meeting_response` integer DEFAULT true NOT NULL, `email_on_session_heads_up` integer DEFAULT true NOT NULL, `email_on_attendee_count_reminder` integer DEFAULT true NOT NULL, `email_on_proposal_join` integer DEFAULT true NOT NULL);
INSERT INTO "guests" VALUES('KH3xfoA5aQ0nM18lsn-eI','Alice Test','alice@test.com','Frontend developer from Osaka. I love talking about **accessibility** and design systems — find me at the coffee machine.','/media/avatars/KH3xfoA5aQ0nM18lsn-eI.webp?v=1791107907574','She/Her',1,1,1,'Osaka, Japan','[{"prompt":"Ask me about","answer":"Accessible design patterns and Japanese web typography"},{"prompt":"Offering","answer":"Code review swaps and coffee-machine debugging sessions"}]','["Japanese","English"]','[{"type":"website","value":"https://alice-test.example.com"},{"type":"telegram","value":"@alice_frontend"}]',0,NULL,1,0,'2026-10-04T06:58:27.574Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('lRV_MMuPjX6NqTuMfEa2W','Bob Test','bob@test.com','Product manager and community organizer from Lagos. I run a local meetup on inclusive product design and I''m always looking for speakers.','/media/avatars/lRV_MMuPjX6NqTuMfEa2W.webp?v=1791107907574','He/Him',1,1,1,'Lagos, Nigeria','[{"prompt":"Looking for","answer":"Speakers for an inclusive product design meetup back home"},{"prompt":"Offering","answer":"Feedback on your product roadmap over coffee"}]','["English","Yoruba"]','[{"type":"email","value":"bob.organizes@example.com"},{"type":"whatsapp","value":"+234 801 234 5678"}]',0,NULL,1,0,'2026-10-03T11:58:27.574Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('IswnQbyqCn7NbXRsGsD2W','Charlie Test','charlie@test.com','Data engineer from Guadalajara. Ask me about stream processing, or better yet, about my sourdough starter.','/media/avatars/IswnQbyqCn7NbXRsGsD2W.webp?v=1791107907574','They/Them',1,1,1,'Guadalajara, Mexico','[{"prompt":"Ask me about","answer":"Stream processing pipelines, or my sourdough starter"},{"prompt":"My weirdest skill","answer":"Naming Kafka topics that still make sense a year later"}]','["Spanish","English"]','[{"type":"discord","value":"charlie.streams"},{"type":"website","value":"https://charlie.dev"}]',0,NULL,1,0,'2026-10-02T16:58:27.574Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('WBHNKMCNBmxx_MlTbJDAD','Yuki Tanaka','yuki.tanaka@example.com',NULL,NULL,'He/Him',1,1,1,NULL,'[{"prompt":"Ask me about","answer":"Retro handheld consoles"}]',NULL,NULL,0,NULL,1,0,'2026-10-01T21:58:27.574Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('Csy_BmrogZyATJ0Rc-yVO','Amara Okafor','amara.okafor@example.com',NULL,NULL,NULL,1,1,1,NULL,NULL,NULL,NULL,0,NULL,1,0,NULL,1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('5i9i_3GcjIBT09rfaKCJZ','Sofía Martínez','sofia.martinez@example.com',NULL,NULL,'She/Her',1,1,1,NULL,NULL,NULL,NULL,1,'scrypt$D05llTQicwNP9Tb629ZbBw==$jT44c3NenNYLEZ65Xt18X/FJGxxQ/78sUODume9Jkyo=',1,0,'2026-09-30T07:58:27.612Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('7ZOGrOLuXLRiOuIcv9flt','Wei Chen','wei.chen@example.com','Platform engineer focused on developer experience.

Previously built CI tooling at a fintech startup in Shanghai. Ask me about `pipeline caching`.','/media/avatars/7ZOGrOLuXLRiOuIcv9flt.webp?v=1791107907579',NULL,1,1,1,'Shanghai, China','[{"prompt":"Ask me about","answer":"Build caching strategies that hold up under real CI load"}]','["Mandarin Chinese","English"]','[{"type":"telegram","value":"@weichen_dev"}]',1,'scrypt$YMlCcFrVeAPjd/ddFlcitw==$R0jk0WdhmPUNl68odY0+NpFVnsGQn82bT+fHDZeWhzY=',1,0,'2026-09-29T12:58:27.615Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('ApV8IbWBVTVCMdBfaJ48D','Priya Sharma','priya.sharma@example.com','ML researcher from Bengaluru working on **fairness in recommendation systems**.

*First time at this conference* — say hi if you see me wandering around looking lost!','/media/avatars/ApV8IbWBVTVCMdBfaJ48D.webp?v=1791107907579','She/Her',1,1,1,'Bengaluru, India','[{"prompt":"Ask me about","answer":"Fairness metrics for recommender systems"},{"prompt":"Looking for","answer":"A conference buddy — this is my first time here!"}]','["Hindi","Kannada","English"]','[{"type":"website","value":"https://priyasharma.example.com"}]',0,NULL,1,0,'2026-09-28T17:58:27.579Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('mansprtxW1DJ8XKr1ZxbH','Lars Eriksson','lars.eriksson@example.com','Backend developer from Gothenburg. In rough order of enthusiasm:

- Rust
- saunas
- Kubernetes (reluctantly)','/media/avatars/mansprtxW1DJ8XKr1ZxbH.webp?v=1791107907579','He/Him',1,1,1,'Gothenburg, Sweden','[{"prompt":"Offering","answer":"Strong opinions about Rust, mild opinions about saunas"}]','["Swedish","English"]','[{"type":"signal","value":"lars.eriksson.99"}]',1,'scrypt$3RpBEgHW0V64GLOavAThng==$f38Mx78w+vUMlItMG/EZnUR7sqg8qbCxoqJnuaSQFKA=',1,0,'2026-09-27T22:58:27.614Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('dPXqkWHGi5eRm0TkIN1T_','Fatima Al-Farsi','fatima.alfarsi@example.com','Security engineer from Muscat. I break things *professionally* and fix them as a hobby. Happy to chat about threat modeling for small teams.','/media/avatars/dPXqkWHGi5eRm0TkIN1T_.webp?v=1791107907579',NULL,1,1,1,'Muscat, Oman','[{"prompt":"Ask me about","answer":"Threat modeling for teams too small to have a security hire"}]','["Arabic","English"]','[{"type":"email","value":"fatima.breaks.things@example.com"}]',1,'scrypt$urHyYNkJiL6uHvWF9oqXNg==$4xtIEdIlUwM6M/vGgIryaSFMVp/TNHFe1a+syS/eWZ0=',1,0,'2026-09-27T03:58:27.613Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('W6jSzvl_D_aDAYrsRkkxU','Kwame Mensah','kwame.mensah@example.com','Founder of a small agritech company in Accra. Interested in offline-first apps and building for low-bandwidth environments.','/media/avatars/W6jSzvl_D_aDAYrsRkkxU.webp?v=1791107907579','He/Him',1,1,1,'Accra, Ghana','[{"prompt":"Offering","answer":"War stories about building for 2G networks"}]','["Twi","English"]','[{"type":"whatsapp","value":"+233 24 555 0187"}]',1,'scrypt$F9eykkUmrbvYvsOART2FFQ==$Eh6B0T6P/7auH3o5TPkyYDu2vTD5nveSPCeBcknSrrs=',1,0,'2026-09-26T08:58:27.651Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('t5DgVPLDS0n9Zfp1mwtgU','Hiroshi Yamamoto','hiroshi.yamamoto@example.com','Embedded systems engineer. I make LEDs blink for a living and I''m not ashamed of it.','/media/avatars/t5DgVPLDS0n9Zfp1mwtgU.webp?v=1791107907580',NULL,1,1,1,'Yokohama, Japan','[{"prompt":"My weirdest skill","answer":"Debugging a blinking LED by ear"}]','["Japanese"]',NULL,1,'scrypt$rSIhPod0L9pMAtbuI77DPQ==$uoykobH3XAcn0rKBgQJLdHjuhS2aqjFiGCixB3xVOxc=',1,0,'2026-09-25T13:58:27.651Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('YX2l5gVowbAVoY-CXUskE','Aisha Diallo','aisha.diallo@example.com','UX researcher from Dakar, currently based in Berlin. I care deeply about research ethics and multilingual interfaces.','/media/avatars/YX2l5gVowbAVoY-CXUskE.webp?v=1791107907580','She/Her',1,1,1,'Berlin, Germany','[{"prompt":"Ask me about","answer":"Research ethics for multilingual user studies"}]','["French","Wolof","English","German"]','[{"type":"website","value":"https://aishadiallo.example.com"},{"type":"other","label":"Mastodon","value":"@aisha@ux.social"}]',1,'scrypt$jcTsehdqsb9jUuU1qV3DrA==$YwGENOpJJK0vioFrAPbHoNtAoHbwKgQpdI82hYp+1iM=',1,0,'2026-09-24T18:58:27.651Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('m69ckm5IrsgDvpRPsTKNV','Diego Fernández','diego.fernandez@example.com','Site reliability engineer from Buenos Aires. On-call survivor, incident retrospective enthusiast, tango dancer on weekends.','/media/avatars/m69ckm5IrsgDvpRPsTKNV.webp?v=1791107907580',NULL,1,1,1,'Buenos Aires, Argentina','[{"prompt":"Offering","answer":"A rundown of the worst incident I ever caused, for entertainment purposes"}]','["Spanish","English"]','[{"type":"telegram","value":"@diego_sre"}]',1,'scrypt$6ojgSu/uFSpnEskzLfB16A==$iUNa4ApgaPBPQw/EQWBkExhuz83sFjYBKUKc4yqwr/I=',1,0,'2026-09-23T23:58:27.651Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('mQSmJ-VPBgUK2gDV2ZITJ','Mei-Ling Wu','meiling.wu@example.com','Technical writer from Taipei. I turn engineering mumbling into documentation people actually read.','/media/avatars/mQSmJ-VPBgUK2gDV2ZITJ.webp?v=1791107907580','She/Her',1,1,1,'Taipei, Taiwan','[{"prompt":"Ask me about","answer":"Turning a wall of Slack threads into docs people read"}]','["Mandarin Chinese","English"]',NULL,1,'scrypt$17gd6CETe5qPgmi60tLUvw==$R1h7kn40qocKHca488Cs3FDV/yTZE49NzzOavDkiRdg=',1,0,'2026-09-23T04:58:27.675Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('felLPYPQshS_hYQoeLaT_','Olga Petrova','olga.petrova@example.com','Database internals nerd. If your query is slow I want to hear about it in excruciating detail.','/media/avatars/felLPYPQshS_hYQoeLaT_.webp?v=1791107907580',NULL,1,1,1,'Novosibirsk, Russia','[{"prompt":"Offering","answer":"A very detailed opinion about your slow query, whether you want it or not"}]','["Russian","English"]','[{"type":"email","value":"olga.petrova.db@example.com"}]',1,'scrypt$o+Njk9C+nH4UKGmKDD+2BA==$nJIH6aW6qt/o4HOfsd3u8P6qknFLl8fNZGpXc6qJvgU=',1,0,'2026-09-22T09:58:27.676Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('HMR8n7D_C5zGxoQtoKE7D','Jean-Pierre Dubois','jeanpierre.dubois@example.com','Engineering manager from Lyon. Interested in sustainable pace, team topologies, and where to find decent cheese near the venue.','/media/avatars/HMR8n7D_C5zGxoQtoKE7D.webp?v=1791107907580','He/Him',1,1,1,'Lyon, France','[{"prompt":"Looking for","answer":"Cheese recommendations near the venue"}]','["French","English"]','[{"type":"whatsapp","value":"+33 6 12 34 56 78"}]',0,NULL,1,0,'2026-09-21T14:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('pJgBPKmbjinvqjurguDSG','Thabo Ndlovu','thabo.ndlovu@example.com','Full-stack developer from Johannesburg working in civic tech. Building tools that help people navigate public services.','/media/avatars/pJgBPKmbjinvqjurguDSG.webp?v=1791107907580',NULL,1,1,1,'Johannesburg, South Africa','[{"prompt":"Ask me about","answer":"Building civic tech that survives contact with real government data"}]','["Zulu","English"]',NULL,0,NULL,1,0,'2026-09-20T19:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('I3NLsVdMJlvCaUmloWg_m','Anna Kowalska','anna.kowalska@example.com','QA engineer from Kraków. I find the bugs you swore were impossible.

Also: board game collector, **200+ and counting**.','/media/avatars/I3NLsVdMJlvCaUmloWg_m.webp?v=1791107907580','She/Her',1,1,1,'Kraków, Poland','[{"prompt":"Offering","answer":"Trades: I''ll find your worst bug for a board game recommendation"}]','["Polish","English"]','[{"type":"discord","value":"anna.qa"}]',0,NULL,1,0,'2026-09-20T00:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('jkh2TC9UTQ5jXzqfwLizh','Mohammed El-Sayed','mohammed.elsayed@example.com','Cloud architect from Cairo. Recovering microservices maximalist — ask me about the monolith we happily went back to.','/media/avatars/jkh2TC9UTQ5jXzqfwLizh.webp?v=1791107907580',NULL,1,1,1,'Cairo, Egypt','[{"prompt":"A hill I will die on","answer":"Boring architecture beats clever architecture, every time"}]','["Arabic","English"]',NULL,0,NULL,1,0,'2026-09-19T05:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('CfYfMK2hR4gMF1bz13sRM','Isabella Rossi','isabella.rossi@example.com','Design lead from Milan. I bridge the gap between Figma and production, one design token at a time.','/media/avatars/CfYfMK2hR4gMF1bz13sRM.webp?v=1791107907580','She/Her',1,1,1,'Milan, Italy','[{"prompt":"Ask me about","answer":"Getting design tokens to survive contact with production"}]','["English","French"]','[{"type":"website","value":"https://isabellarossi.example.com"}]',0,NULL,1,0,'2026-09-18T10:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('eUTS7VZUHxRztCDUt5rxe','Min-jun Kim','minjun.kim@example.com','Game developer from Seoul, moonlighting in web tech. Fascinated by real-time collaboration and CRDTs.','/media/avatars/eUTS7VZUHxRztCDUt5rxe.webp?v=1791107907580','They/Them',1,1,1,'Seoul, South Korea','[{"prompt":"Currently obsessed with","answer":"CRDTs, and why conflict-free replication is harder than it sounds"}]','["Korean","English"]','[{"type":"discord","value":"minjunkim"}]',0,NULL,1,0,'2026-09-17T15:58:27.580Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('ErnEvyixQnkAvuVAh4bv6','Carlos Silva','carlos.silva@example.com','DevOps engineer from Porto. I automate myself out of a job roughly once a year and somehow still have one.','/media/avatars/ErnEvyixQnkAvuVAh4bv6.webp?v=1791107907581',NULL,1,1,1,'Porto, Portugal','[{"prompt":"Offering","answer":"A talk about automating yourself out of a job, repeatedly"}]','["Portuguese","English"]',NULL,0,NULL,1,0,'2026-09-16T20:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('CiX9cRrwJiGHFqt1To2vX','Nadia Haddad','nadia.haddad@example.com','Mobile developer from Beirut. Flutter by day, native by necessity. Organizer of a local women-in-tech mentoring circle.',NULL,'She/Her',1,1,1,'Beirut, Lebanon','[{"prompt":"Looking for","answer":"Mentors and mentees for a women-in-tech circle back home"}]','["Arabic","French","English"]','[{"type":"other","label":"Instagram","value":"@nadia.builds"}]',0,NULL,1,0,'2026-09-16T01:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('HBaMqp-NtQJctBdn2oCbS','Freya Nielsen','freya.nielsen@example.com','Accessibility consultant from Copenhagen. Screen reader power user. I will happily audit your conference talk slides.',NULL,NULL,1,1,1,'Copenhagen, Denmark','[{"prompt":"Offering","answer":"A free accessibility pass on your slides — bring your laptop"}]','["Danish","English"]','[{"type":"email","value":"freya.a11y@example.com"}]',0,NULL,1,0,'2026-09-15T06:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('MuwFQb2m-Ux3Zpq27RA5J','Arjun Nair','arjun.nair@example.com','Distributed systems engineer from Kochi. Currently obsessed with consensus protocols and filter coffee, in that order.',NULL,'He/Him',1,1,1,'Kochi, India','[{"prompt":"Currently obsessed with","answer":"Consensus protocols, and where filter coffee ranks among them"}]','["Malayalam","English"]',NULL,0,NULL,1,0,'2026-09-14T11:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('NjfILIKw5lpMwE8wIm9rw','Elif Yılmaz','elif.yilmaz@example.com','Computer science student from Istanbul, here on a scholarship ticket. Excited about everything, please recommend me sessions!',NULL,NULL,1,1,1,'Istanbul, Turkey','[{"prompt":"Looking for","answer":"Session recommendations — I''m new here and excited about everything"}]','["Turkish","English"]',NULL,0,NULL,1,0,'2026-09-13T16:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('tMTYBscBvrY3UzeU96E8X','Samuel Adeyemi','samuel.adeyemi@example.com','Backend engineer from Ibadan working on payment infrastructure across West Africa.',NULL,NULL,1,1,1,'Ibadan, Nigeria',NULL,'["Yoruba","English"]',NULL,0,NULL,1,0,'2026-09-12T21:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('spQSZeX7xXbnA8PdFDn4t','Linh Nguyen','linh.nguyen@example.com','Freelance web developer from Ho Chi Minh City. Jamstack fan, static site generator connoisseur, occasional conference speaker.',NULL,'They/Them',1,1,1,'Ho Chi Minh City, Vietnam','[{"prompt":"Offering","answer":"Static site generator recommendations, unsolicited and opinionated"}]','["Vietnamese","English"]','[{"type":"telegram","value":"@linh_jamstack"}]',0,NULL,1,0,'2026-09-12T02:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('wlcahNVNIVSc54-_Yj_6K','Marta Horvat','marta.horvat@example.com','Agile coach from Zagreb. Yes, we can talk about whether estimates are worth it. No, we won''t agree.',NULL,NULL,1,1,1,'Zagreb, Croatia','[{"prompt":"A hill I will die on","answer":"Estimates are a communication tool, not a promise"}]','["Croatian","English"]',NULL,0,NULL,1,0,'2026-09-11T07:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('-co1SIEViS_74Nne7F_tn','Dmitri Volkov','dmitri.volkov@example.com','Compiler engineer. I read language specs for fun and I''m told this is concerning.',NULL,NULL,1,1,1,NULL,'[{"prompt":"My weirdest skill","answer":"Reading language specs for fun, apparently"}]',NULL,NULL,0,NULL,1,0,'2026-09-10T12:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('4gutz55F-QHGfFPFfdjwv','Chiara Bianchi','chiara.bianchi@example.com','Data scientist from Bologna working in public health. Interested in reproducible research and open data.',NULL,'She/Her',1,1,1,'Bologna, Italy','[{"prompt":"Ask me about","answer":"Making public health research reproducible without a data team"}]',NULL,'[{"type":"website","value":"https://chiarabianchi.example.com"}]',0,NULL,1,0,'2026-09-09T17:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('C0HmEuvkIpc1gF1giGvwa','Zanele Khumalo','zanele.khumalo@example.com','Frontend developer from Durban. CSS is my love language. Currently deep-diving into container queries.',NULL,NULL,1,1,1,'Durban, South Africa','[{"prompt":"Offering","answer":"Container query wizardry, upon request"}]','["Zulu","English"]',NULL,0,NULL,1,0,'2026-09-08T22:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('QP-lEjBteOzXVC_SwiB38','Rafael Souza','rafael.souza@example.com','Engineering lead from São Paulo. I care about:

1. Mentoring junior devs
2. Building teams where questions are welcome
3. Coffee, not necessarily in that order',NULL,NULL,1,1,1,'São Paulo, Brazil','[{"prompt":"Offering","answer":"Mentoring conversations for junior devs finding their footing"}]','["Portuguese","English"]','[{"type":"website","value":"https://rafaelsouza.example.com"}]',0,NULL,1,0,'2026-09-08T03:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('zqrsPDdZpo61XLeStMzTP','Hana Kobayashi','hana.kobayashi@example.com','# Hi, I''m Hana!

Developer advocate based in Kyoto. I write tutorials, give talks, and collect conference stickers *competitively*.','/media/avatars/zqrsPDdZpo61XLeStMzTP.webp?v=1791107907581','She/Her',1,1,1,'Kyoto, Japan','[{"prompt":"I collect","answer":"Conference stickers, competitively"}]','["Japanese","English"]','[{"type":"website","value":"https://hanakobayashi.example.com"},{"type":"other","label":"Bluesky","value":"@hanak.dev"}]',0,NULL,1,0,'2026-09-07T08:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('8Y4m2fOhOxAi1OQk9dv7m','Tereza Nováková','tereza.novakova@example.com','Open source maintainer from Prague — see [my projects](https://github.example.com/tereza). Ask me about sustainable maintainership, or just send `git help`, either works.',NULL,NULL,1,1,1,'Prague, Czechia','[{"prompt":"Ask me about","answer":"Sustainable maintainership for projects that outlive their funding"}]','["Czech","English"]','[{"type":"website","value":"https://github.example.com/tereza"}]',0,NULL,1,0,'2026-09-06T13:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('ZEWIRXSjbqW_a6Cpdax7W','Ahmad Karimi','ahmad.karimi@example.com','Software engineer from Tehran, now in Amsterdam. Working on developer tooling and learning Dutch, slowly.',NULL,'He/Him',1,1,1,'Amsterdam, Netherlands','[{"prompt":"Currently obsessed with","answer":"Developer tooling, and slowly learning Dutch"}]','["Persian","Dutch","English"]',NULL,0,NULL,1,0,'2026-09-05T18:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('XDWlCENodtX7WgvxQZt83','Maria Papadopoulou','maria.papadopoulou@example.com','Tech lead from Thessaloniki. Legacy code whisperer. Strong opinions on testing, loosely held on everything else.',NULL,NULL,1,1,1,'Thessaloniki, Greece','[{"prompt":"Offering","answer":"Loosely held opinions on everything except testing"}]','["Greek","English"]',NULL,0,NULL,1,0,'2026-09-04T23:58:27.581Z',1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('n1q2bwTgEUk3zrC9wnF4-','Mateo Quispe','mateo.quispe@example.com',NULL,NULL,NULL,1,1,1,NULL,NULL,NULL,NULL,0,NULL,1,0,NULL,1,1,1,1,1,1,1);
INSERT INTO "guests" VALUES('sJ9x5dTy1G3354WUz-PBl','Leilani Kahale','leilani.kahale@example.com',NULL,NULL,'She/They',1,1,1,NULL,NULL,NULL,NULL,0,NULL,1,0,'2026-09-03T09:58:27.581Z',1,1,1,1,1,1,1);
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`bookable` integer DEFAULT false NOT NULL,
	`sort_index` integer DEFAULT 0 NOT NULL,
	`area_description` text
);
INSERT INTO "locations" VALUES('loc-main-hall','Main Hall','/locations/loc-main-hall.jpg','Our largest venue, featuring a professional stage with tiered seating. Equipped with full AV including projector and sound system. Ideal for keynotes, panels, and large-audience sessions.',100,'blue',1,1,'Ground floor, East Wing');
INSERT INTO "locations" VALUES('loc-room-a','Workshop Room','/locations/loc-room-a.jpg','A bright breakout room with whiteboards and flexible seating. Natural light and a relaxed atmosphere make it well suited for workshops and interactive sessions.',30,'green',1,2,'1st floor, West Wing');
INSERT INTO "locations" VALUES('loc-room-b','Garden Terrace','/locations/loc-room-b.jpg','An informal outdoor space with picnic tables overlooking the lake. Perfect for open-space sessions, unconference discussions, and casual networking.',25,'red',1,3,'Outdoor, South Courtyard');
INSERT INTO "locations" VALUES('loc-library','Reading Room','/locations/loc-library.jpg','A quiet, book-lined room with a grand skylight and long communal tables. Great for focused breakout sessions or attendees who need a calm space to work between talks.',40,'amber',1,4,'2nd floor, North Wing');
INSERT INTO "locations" VALUES('loc-boardroom','Boardroom','/locations/loc-boardroom.jpg','A compact meeting room with a glass-walled conference table and video conferencing setup. Well suited for small-group discussions, interviews, or sponsor meetings.',10,'indigo',1,5,'1st floor, East Wing');
INSERT INTO "locations" VALUES('loc-auditorium','Auditorium','/locations/loc-auditorium.jpg','A tiered lecture theatre with fixed seating and a large presentation screen. Best for high-attendance keynotes and formal talks that don''t need audience interaction.',200,'orange',1,6,'Ground floor, West Wing');
INSERT INTO "locations" VALUES('loc-courtyard','Courtyard','/locations/loc-courtyard.jpg','A dramatic covered courtyard framed by stone arches, open to the sky above. Works well as a striking gathering point between sessions or a quiet spot to reflect.',50,'sky',1,7,'Ground floor, Central Courtyard');
INSERT INTO "locations" VALUES('loc-rooftop','Rooftop Terrace','/locations/loc-rooftop.jpg','An open-air rooftop space with skyline views and casual seating. Ideal for informal chats, evening socials, or breakout conversations away from the main venue.',20,'teal',1,8,'Rooftop, East Wing');
CREATE TABLE "days" (
	`id` text PRIMARY KEY NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`start_bookings` text NOT NULL,
	`end_bookings` text NOT NULL,
	`event_id` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "days" VALUES('tKjPNxKcQXPMJ2ORybNir','2026-11-15T08:00:00.000Z','2026-11-15T17:00:00.000Z','2026-11-15T08:00:00.000Z','2026-11-15T16:30:00.000Z','CEeA7A1EGNKg4ElF256p4');
INSERT INTO "days" VALUES('UC4VKWa7rALm-aNdsgmJr','2026-11-16T08:00:00.000Z','2026-11-16T17:00:00.000Z','2026-11-16T08:00:00.000Z','2026-11-16T16:30:00.000Z','CEeA7A1EGNKg4ElF256p4');
INSERT INTO "days" VALUES('T5mScaBD3-XLxgR2cNe1-','2026-11-17T08:00:00.000Z','2026-11-17T17:00:00.000Z','2026-11-17T08:00:00.000Z','2026-11-17T16:30:00.000Z','CEeA7A1EGNKg4ElF256p4');
INSERT INTO "days" VALUES('HebY2-lvsbpGnM20sn9aa','2026-11-01T08:00:00.000Z','2026-11-01T17:00:00.000Z','2026-11-01T08:00:00.000Z','2026-11-01T16:30:00.000Z','ahNcYyOhWe34CsrVdaPJ2');
INSERT INTO "days" VALUES('vd7kSKxqUJBY6-UTcEJXc','2026-11-02T08:00:00.000Z','2026-11-02T17:00:00.000Z','2026-11-02T08:00:00.000Z','2026-11-02T16:30:00.000Z','ahNcYyOhWe34CsrVdaPJ2');
INSERT INTO "days" VALUES('tMqia_CCWaHVg5aT_k97u','2026-11-03T08:00:00.000Z','2026-11-03T17:00:00.000Z','2026-11-03T08:00:00.000Z','2026-11-03T16:30:00.000Z','ahNcYyOhWe34CsrVdaPJ2');
INSERT INTO "days" VALUES('rGY7s2MXnVdxwDxLAEsDg','2026-10-18T07:00:00.000Z','2026-10-18T16:00:00.000Z','2026-10-18T07:00:00.000Z','2026-10-18T15:30:00.000Z','fHvlvt0u4u_ipYdqvYykd');
INSERT INTO "days" VALUES('-998NIISfcpO8Hdol2dXa','2026-10-19T07:00:00.000Z','2026-10-19T16:00:00.000Z','2026-10-19T07:00:00.000Z','2026-10-19T15:30:00.000Z','fHvlvt0u4u_ipYdqvYykd');
INSERT INTO "days" VALUES('JuJV6tuHrTstDAzfQ9FPA','2026-10-20T07:00:00.000Z','2026-10-21T01:00:00.000Z','2026-10-20T07:00:00.000Z','2026-10-21T00:30:00.000Z','fHvlvt0u4u_ipYdqvYykd');
CREATE TABLE "event_guests" (
	`event_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `guest_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','pJgBPKmbjinvqjurguDSG');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','XDWlCENodtX7WgvxQZt83');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "event_guests" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','pJgBPKmbjinvqjurguDSG');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','XDWlCENodtX7WgvxQZt83');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "event_guests" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','pJgBPKmbjinvqjurguDSG');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','XDWlCENodtX7WgvxQZt83');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "event_guests" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl');
CREATE TABLE "event_locations" (
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `location_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-main-hall');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-room-a');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-room-b');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-library');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-boardroom');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-auditorium');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-courtyard');
INSERT INTO "event_locations" VALUES('CEeA7A1EGNKg4ElF256p4','loc-rooftop');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-main-hall');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-room-a');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-room-b');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-library');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-boardroom');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-auditorium');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-courtyard');
INSERT INTO "event_locations" VALUES('ahNcYyOhWe34CsrVdaPJ2','loc-rooftop');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-main-hall');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-room-a');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-room-b');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-library');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-boardroom');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-auditorium');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-courtyard');
INSERT INTO "event_locations" VALUES('fHvlvt0u4u_ipYdqvYykd','loc-rooftop');
CREATE TABLE "proposal_hosts" (
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`proposal_id`, `guest_id`),
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_hosts" VALUES('UYPJ3fkjt1UHAdKXREiBK','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "proposal_hosts" VALUES('ZI4tTb3VuZJcyAUmaSFAn','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('ICcJo2pffvCXidpRz0zyq','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "proposal_hosts" VALUES('EMsxgebwVfOy3qd2njMme','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "proposal_hosts" VALUES('EMsxgebwVfOy3qd2njMme','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "proposal_hosts" VALUES('y8TI7FIiCwxedoEMBUA1v','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "proposal_hosts" VALUES('y8TI7FIiCwxedoEMBUA1v','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "proposal_hosts" VALUES('Aqly1yyLHYp53vTM7jGu-','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "proposal_hosts" VALUES('7s3ekLnxZ7yrRUcXlVv0Q','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "proposal_hosts" VALUES('KHJGncfmpIOKKjZPq_s5-','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "proposal_hosts" VALUES('8NHl7s0JlFxr_F0CkxGPR','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('XzLUY3ZT1PoqLsFSYrfQ9','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "proposal_hosts" VALUES('IRdIF6ucRCHy7odPGwL3f','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('cP0ba6i774S5qCg8uc6n7','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "proposal_hosts" VALUES('cP0ba6i774S5qCg8uc6n7','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "proposal_hosts" VALUES('UKoot4sOyUe6YP2IfGjER','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "proposal_hosts" VALUES('tRDOBUYKcwfqgulCzw648','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "proposal_hosts" VALUES('JltQgTla40_fihoB2rESV','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "proposal_hosts" VALUES('Fe5EIjrgEU1t8Pwqt9ALs','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "proposal_hosts" VALUES('Fe5EIjrgEU1t8Pwqt9ALs','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "proposal_hosts" VALUES('KZDhFQIrsJAY5E3iOwc5O','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "proposal_hosts" VALUES('JdjzCDd5rVoNv4_X6ras0','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "proposal_hosts" VALUES('e0Sojqsyahj00ZR4KSvBB','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('Dxbzoa9-ddKxZ2rb_g1hl','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "proposal_hosts" VALUES('w0eWIe1nz5Z32uXe8DUpN','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('C6ZchP13LYh4q4gNLtPoG','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "proposal_hosts" VALUES('_sukbTUQ8dxvRGFeeSesP','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "proposal_hosts" VALUES('ryCpFeoiOPkOxJzCY2U_V','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "proposal_hosts" VALUES('qtz5Z7fj1rd3vSlfVl_Oj','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "proposal_hosts" VALUES('-dHmMZU9vINwI8n4VJvBu','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "proposal_hosts" VALUES('gNM6bQ9rCnfXEgpCq2vZE','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "proposal_hosts" VALUES('T8eqMqOwRkIbvARD6buMu','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "proposal_hosts" VALUES('B3EY2YoqGYU3Y4ao-cSbq','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "proposal_hosts" VALUES('XGcZR0RBZshontgBN8zFz','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "proposal_hosts" VALUES('fDfkj_A3YHQgf0wA11HnH','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "proposal_hosts" VALUES('PqPhLTi8GZt6zd0LfzT7M','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "proposal_hosts" VALUES('gfn9WoF2ZeU7USBbQXEo3','felLPYPQshS_hYQoeLaT_');
INSERT INTO "proposal_hosts" VALUES('xLfbrVvLQHttdUs4Jsqfu','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "proposal_hosts" VALUES('0suS1VYA4ThBo69EmSnTO','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "proposal_hosts" VALUES('PUyTEB86fdKssANiw2Z5Z','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "proposal_hosts" VALUES('PUyTEB86fdKssANiw2Z5Z','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "proposal_hosts" VALUES('Kd31uzYlG2SJXTCxU4B6n','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "proposal_hosts" VALUES('drp02tnCSlduoXCGpBQh6','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "proposal_hosts" VALUES('yK6ktOWVUW7DLCbTVofXO','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "proposal_hosts" VALUES('zZJCYCZNXvcyaq66wpufI','dPXqkWHGi5eRm0TkIN1T_');
CREATE TABLE "rsvps" (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "rsvps" VALUES('0LVkhdUPE0R1PruIX7xW7','EjXm8uh6qTecmr1FfiX0A','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('mywdD44RTIABPn9kgJm2q','W40VrZg5VhgM-p7tfCGis','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('oytCg4WUBIuvg46yHNT4S','AIKSgQ1zFCVvzU216S87n','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('wikh7pTGaT_94ki3muXuk','xaKVSGCLL3BsGUopeo4vS','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('7AsGKcsK-V5CEcxeZsVBj','DgxPPdJMWm_VLUl5HImfU','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('BdEOlHLQtBBwERygauPG9','gX6i_M_dOtR5nk2-ggsZY','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "rsvps" VALUES('P4SrEPwKP7WbKPx8EyIP1','cl0XFrbAvEpXPd3R7HMOd','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('RQWDMmFKiNF1twOvDnXAp','OaIVrOTsjyle0dW2xFa-R','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('xzr6822nMsXzsv_zpELT4','coDqGOSo1L6mdIN4QZdFq','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('QkQJrC4kc5254qABeYCgQ','q0nBxEMD9qmO2NiBK2Qmq','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('iujDXSL2a6rLebyTkdmti','DgxPPdJMWm_VLUl5HImfU','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('WR9cSwK3gYdkSm7MjnXXP','tWKW2d-M87Rm5yJAOVfHw','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "rsvps" VALUES('a7GBLw6BVzax6OlgZhjtu','AIKSgQ1zFCVvzU216S87n','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "rsvps" VALUES('HG_2LgoijrBoTHyQgx3qS','w22sXfqYp_4K-jzZSK2C5','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "rsvps" VALUES('W_wpo_lGljkS6sgs2D23r','JSFbkDLV2SXffkLMUqsoI','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "rsvps" VALUES('igmUEr-A3eRKZmHWHmIyJ','gX6i_M_dOtR5nk2-ggsZY','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "rsvps" VALUES('B6gvHq1ivIqXB8hJsYzhX','AIKSgQ1zFCVvzU216S87n','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "rsvps" VALUES('Ke_NZUt3W13gHzcAjtjgP','coDqGOSo1L6mdIN4QZdFq','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "rsvps" VALUES('yZML6xNVfS_tA3-JKymOH','w22sXfqYp_4K-jzZSK2C5','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "rsvps" VALUES('GjKSjH82Hyovs85MeGude','dHJVXduZbvyIn2x0gUolV','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "rsvps" VALUES('U8GebV7tIGU6X4Oc-oPWu','tWKW2d-M87Rm5yJAOVfHw','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "rsvps" VALUES('BfzCX5P--GfHYB3RcODrh','EjXm8uh6qTecmr1FfiX0A','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "rsvps" VALUES('NCPMnNreU4o7Ti1N-krfh','OaIVrOTsjyle0dW2xFa-R','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "rsvps" VALUES('JGOSAGSasBG5Pc5MKSKO5','ZBmYh374V--830nt0XeiO','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "rsvps" VALUES('kSeEcSU4VFajM_NPEUnNo','dHJVXduZbvyIn2x0gUolV','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "rsvps" VALUES('p_CKXoO7iyd_gRaa7pBBP','LI3QOfdBHbjIr6v3k0nZr','Csy_BmrogZyATJ0Rc-yVO');
INSERT INTO "rsvps" VALUES('qMshgEiqNuKtbE1KorMV5','EjXm8uh6qTecmr1FfiX0A','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('aWJoq65O5sOSBbnsi8vZt','OaIVrOTsjyle0dW2xFa-R','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('wstbmoGHh2AitlkGuZdqH','coDqGOSo1L6mdIN4QZdFq','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('4XkrJ8AIQR-ZSe19WljkH','w22sXfqYp_4K-jzZSK2C5','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('0BIIcD7zIRyzq9IYRIZD4','JSFbkDLV2SXffkLMUqsoI','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('3e2Bv-guhUiJskyOs1IB0','wbo61NcnAIXZUf_bbx3f-','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('bEgcJY9fd5Z6wWJ26ELL0','DgxPPdJMWm_VLUl5HImfU','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('myXcMxqQaXBUA4r7lUmBC','tWKW2d-M87Rm5yJAOVfHw','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "rsvps" VALUES('Lf6kBHVnCwRCmI5v9J3K4','EjXm8uh6qTecmr1FfiX0A','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('sU55lNgp21j24BRaz48Uu','AIKSgQ1zFCVvzU216S87n','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('02x-4unX6bf3Rh6Uzw-dy','coDqGOSo1L6mdIN4QZdFq','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('6LNDRg_DKKIjqz87kkEee','wbo61NcnAIXZUf_bbx3f-','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('sh4AQeIs8AGq_P9Qx8UWG','sDcTHgpVk4j_lO2cO2UTT','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('e8Jf7DgWihgo5SK_e4gCD','LI3QOfdBHbjIr6v3k0nZr','7ZOGrOLuXLRiOuIcv9flt');
INSERT INTO "rsvps" VALUES('UnONkS4679RH2oYTfud-V','EjXm8uh6qTecmr1FfiX0A','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('mgiU2fiL_uQnnC3fZojMp','OaIVrOTsjyle0dW2xFa-R','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('grY3gtn1EgknZ-9Hr0rhX','ZBmYh374V--830nt0XeiO','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('kNtjLsfHv-VHtuzBcsBWF','xaKVSGCLL3BsGUopeo4vS','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('-sQyXZLVsoK2arbnugLIu','MSvAPIFXDq01HHS9JDgtN','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('OdIVxf-sPkTnksrLTW4PI','gX6i_M_dOtR5nk2-ggsZY','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "rsvps" VALUES('Vlrg5u5qndzE3MXHhdIj2','cl0XFrbAvEpXPd3R7HMOd','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('IvB_KdNyKOBHMuQ8v4fXt','OaIVrOTsjyle0dW2xFa-R','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('NL9VyXVSo3F6P3icgyor4','ZBmYh374V--830nt0XeiO','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('x3FMPeNGb-MOZDqH7ANak','q0nBxEMD9qmO2NiBK2Qmq','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('Im2BNjg8zvYT20vN-aRAI','MSvAPIFXDq01HHS9JDgtN','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('R9yCGd5m0Wqw4K_DMqS2h','gX6i_M_dOtR5nk2-ggsZY','mansprtxW1DJ8XKr1ZxbH');
INSERT INTO "rsvps" VALUES('zBf1_p_creULs3_ursryM','OaIVrOTsjyle0dW2xFa-R','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "rsvps" VALUES('Axuir3wtnrSXsOlxKxzii','q0nBxEMD9qmO2NiBK2Qmq','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "rsvps" VALUES('CNlXWRwKYr-crW-vnawlm','JSFbkDLV2SXffkLMUqsoI','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "rsvps" VALUES('aenwqm8bR2OfEXNRZ54li','DgxPPdJMWm_VLUl5HImfU','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "rsvps" VALUES('zSUK_IX-4n0adwavuWoRy','OaIVrOTsjyle0dW2xFa-R','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('GwsfTVauOp2cXUdILSZx6','coDqGOSo1L6mdIN4QZdFq','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('XN43L7rCOeo4U97J-ErjE','q0nBxEMD9qmO2NiBK2Qmq','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('7S6QUuvBPsN6sA4sEc2k6','xaKVSGCLL3BsGUopeo4vS','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('ISnNYyYmMs43lfs6bEGnY','MSvAPIFXDq01HHS9JDgtN','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('webei2UL3YBlyIaBow-fj','sDcTHgpVk4j_lO2cO2UTT','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('2QWm0EENP1pCFaOwA7Qn9','tWKW2d-M87Rm5yJAOVfHw','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "rsvps" VALUES('T5TXK5H6wTSVx5mAhwRyG','EjXm8uh6qTecmr1FfiX0A','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('DvXEWayXKIYYWbek5GqhR','W40VrZg5VhgM-p7tfCGis','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('gP3LSlYF2J65kP5c9GWnD','w22sXfqYp_4K-jzZSK2C5','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('6wBU-q1kOyquTG69G02dH','JSFbkDLV2SXffkLMUqsoI','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('buUnqnRN1omgmXt96yn8G','xaKVSGCLL3BsGUopeo4vS','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('iayFPSGERqNS76tWvSP0X','LI3QOfdBHbjIr6v3k0nZr','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('wy5gvZoFqya2ZlfczdmWt','tWKW2d-M87Rm5yJAOVfHw','t5DgVPLDS0n9Zfp1mwtgU');
INSERT INTO "rsvps" VALUES('ndndMR1qNJjLNAvVruCjp','EjXm8uh6qTecmr1FfiX0A','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "rsvps" VALUES('9UVMBerOd6MdyDo35yH9E','OaIVrOTsjyle0dW2xFa-R','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "rsvps" VALUES('hyrGCgEfbAqFoOQsXf99k','tWKW2d-M87Rm5yJAOVfHw','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "rsvps" VALUES('NlNBST4M3lyyiBNnU3ON6','EjXm8uh6qTecmr1FfiX0A','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "rsvps" VALUES('dcL675Yo1QwfZixctiAUe','sDcTHgpVk4j_lO2cO2UTT','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "rsvps" VALUES('cHzs2i98G4sSl8Tqwjfaw','gX6i_M_dOtR5nk2-ggsZY','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "rsvps" VALUES('GDCGjAcMR4EgmSeT4xgX4','EjXm8uh6qTecmr1FfiX0A','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('2QDKp_WCsr3ktyo_mvpjK','OaIVrOTsjyle0dW2xFa-R','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('fH2h48GWsTmJPSUqOKtdq','q0nBxEMD9qmO2NiBK2Qmq','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('bydp0LhiAv8GKK9gBMsJD','dHJVXduZbvyIn2x0gUolV','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('hr9fGdVui5SXk2S7sV0pS','xaKVSGCLL3BsGUopeo4vS','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('1cyfERUSsjvE7pkFBz0B-','tWKW2d-M87Rm5yJAOVfHw','mQSmJ-VPBgUK2gDV2ZITJ');
INSERT INTO "rsvps" VALUES('7GW8SATh52dCZ4u9WwTIo','JSFbkDLV2SXffkLMUqsoI','felLPYPQshS_hYQoeLaT_');
INSERT INTO "rsvps" VALUES('98Kr5f7Gv3Qso7p1uafNN','xaKVSGCLL3BsGUopeo4vS','felLPYPQshS_hYQoeLaT_');
INSERT INTO "rsvps" VALUES('maza7HR05PpfUh-kldTVi','sDcTHgpVk4j_lO2cO2UTT','felLPYPQshS_hYQoeLaT_');
INSERT INTO "rsvps" VALUES('XtOfruylVcLKnCixRhsQQ','LI3QOfdBHbjIr6v3k0nZr','felLPYPQshS_hYQoeLaT_');
INSERT INTO "rsvps" VALUES('BQC7JKQ6nFTT89CWVefs0','EjXm8uh6qTecmr1FfiX0A','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('_M8j5xnADxaFU04X7Ncox','W40VrZg5VhgM-p7tfCGis','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('jDppzUONyjHxm4XWIvyK0','OaIVrOTsjyle0dW2xFa-R','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('SyBE6DzlEuBHB2143IYxU','w22sXfqYp_4K-jzZSK2C5','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('JFfpngXyVLmOwfbDMfosm','wbo61NcnAIXZUf_bbx3f-','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('RBbtd-GQDDD_lEIAyzco0','LI3QOfdBHbjIr6v3k0nZr','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('1LENbnGYZR5_9rjCMsge7','tWKW2d-M87Rm5yJAOVfHw','HMR8n7D_C5zGxoQtoKE7D');
INSERT INTO "rsvps" VALUES('SsZOH98xICoJCCX2WVaU7','EjXm8uh6qTecmr1FfiX0A','pJgBPKmbjinvqjurguDSG');
INSERT INTO "rsvps" VALUES('5-LSKDqE0DROAM_SBm2si','W40VrZg5VhgM-p7tfCGis','pJgBPKmbjinvqjurguDSG');
INSERT INTO "rsvps" VALUES('pEYqrli8gerbn8NL03L4f','MSvAPIFXDq01HHS9JDgtN','pJgBPKmbjinvqjurguDSG');
INSERT INTO "rsvps" VALUES('8vail3LEOYcOPf5N7H7PK','DgxPPdJMWm_VLUl5HImfU','pJgBPKmbjinvqjurguDSG');
INSERT INTO "rsvps" VALUES('3NX3AYKSnEm4uRdrRtIv5','EjXm8uh6qTecmr1FfiX0A','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('yXX4irLXBn5I8BdS6sbQK','W40VrZg5VhgM-p7tfCGis','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('Jo7F66tMHWtHEdp7Yapjj','ZBmYh374V--830nt0XeiO','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('afgmGWylXpXHkC3cyTa-G','JSFbkDLV2SXffkLMUqsoI','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('VlZoHVF5pBN50DH5pVEcq','MSvAPIFXDq01HHS9JDgtN','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('-o3ruXLV1U0vAxx13LhIg','sDcTHgpVk4j_lO2cO2UTT','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('Ns_yetiJpOGnT8MDxI-Bj','LI3QOfdBHbjIr6v3k0nZr','I3NLsVdMJlvCaUmloWg_m');
INSERT INTO "rsvps" VALUES('EA2W453ZnsKLKL5noRB0f','W40VrZg5VhgM-p7tfCGis','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('DJRIPQZVBYXRFT_zcK3vJ','AIKSgQ1zFCVvzU216S87n','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('SoGi5d5swVNlNRtKt5Kbu','w22sXfqYp_4K-jzZSK2C5','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('ZgQMczxVMNL5Te91mv5Y3','dHJVXduZbvyIn2x0gUolV','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('vd7m55diNiuaxzL5b7FUt','DgxPPdJMWm_VLUl5HImfU','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('17d_Erb0-siVv9hlWMuF1','gX6i_M_dOtR5nk2-ggsZY','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('_kTY1jZZbMJbAzhFohQc2','tWKW2d-M87Rm5yJAOVfHw','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "rsvps" VALUES('ahYObStdV1j_R4RD-pyQj','cl0XFrbAvEpXPd3R7HMOd','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "rsvps" VALUES('OTSnZBqI6fvAXxVPdNsLn','w22sXfqYp_4K-jzZSK2C5','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "rsvps" VALUES('WbV63h2YyGVZYvPwAJyc0','JSFbkDLV2SXffkLMUqsoI','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "rsvps" VALUES('NRM1etmHhwTl_cXN2V1Y4','MSvAPIFXDq01HHS9JDgtN','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "rsvps" VALUES('gE3prf11yHNpc-0WhGtCU','sDcTHgpVk4j_lO2cO2UTT','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "rsvps" VALUES('1SSddT9eIi7RhMPpAustd','EjXm8uh6qTecmr1FfiX0A','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "rsvps" VALUES('t2-wBl23deJ9vRiLwWk1E','AIKSgQ1zFCVvzU216S87n','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "rsvps" VALUES('RTU0odsEPqUQMhFIMfwGJ','dHJVXduZbvyIn2x0gUolV','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "rsvps" VALUES('l_Lqs6m2F8bFgT4x2V4tN','sDcTHgpVk4j_lO2cO2UTT','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "rsvps" VALUES('ducnNruRGaN5oLMFbakjR','tWKW2d-M87Rm5yJAOVfHw','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "rsvps" VALUES('kEGValrLnpZQQyYPTqHSQ','W40VrZg5VhgM-p7tfCGis','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "rsvps" VALUES('0f7JSBK47bdwPqUWMtjYm','OaIVrOTsjyle0dW2xFa-R','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "rsvps" VALUES('OU9lVoxmVYyyMB1EzN1Lw','w22sXfqYp_4K-jzZSK2C5','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "rsvps" VALUES('lpAmJSEqf57fHcRE8jrc_','LI3QOfdBHbjIr6v3k0nZr','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "rsvps" VALUES('M4Y0HHlOW9V8RALeWS-un','gX6i_M_dOtR5nk2-ggsZY','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "rsvps" VALUES('O2eu507OgBwnk1rG6IjyV','W40VrZg5VhgM-p7tfCGis','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('4gz6oaRQDt-Z_Am7u7nwP','AIKSgQ1zFCVvzU216S87n','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('9L0I9jHz8ZJb0OdGpTSUX','ZBmYh374V--830nt0XeiO','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('DM5upc8TP_49EHs8CBp6m','xaKVSGCLL3BsGUopeo4vS','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('FXyEqo-lSa84mdmWHRG0Z','MSvAPIFXDq01HHS9JDgtN','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('nwPitWBJvo_rP-l4bvR-k','DgxPPdJMWm_VLUl5HImfU','CiX9cRrwJiGHFqt1To2vX');
INSERT INTO "rsvps" VALUES('qoLZZr8E7dn9S9PLFxqmE','EjXm8uh6qTecmr1FfiX0A','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('v6vEoalzPWeofrCyDHJtF','cl0XFrbAvEpXPd3R7HMOd','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('kErrFL29xNNJk-0xeQsqK','w22sXfqYp_4K-jzZSK2C5','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('Go8GuekL5eWR0i3RGt-J6','LI3QOfdBHbjIr6v3k0nZr','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('S6nTPTjs9GsXUfXGps8ly','gX6i_M_dOtR5nk2-ggsZY','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('8Iss_s6LOiPFeRwRoKeL9','tWKW2d-M87Rm5yJAOVfHw','HBaMqp-NtQJctBdn2oCbS');
INSERT INTO "rsvps" VALUES('9LATYLTJ1qNu1XacAo25J','cl0XFrbAvEpXPd3R7HMOd','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('BL-tUSQseFgt4Tif-0OyU','OaIVrOTsjyle0dW2xFa-R','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('aVD6XzFjvM9Ly0DU3yYjp','xaKVSGCLL3BsGUopeo4vS','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('8KPnHFo7ZGxqNHYxzatWg','MSvAPIFXDq01HHS9JDgtN','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('0IUfWqNP-jyHDodbPo9st','sDcTHgpVk4j_lO2cO2UTT','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('OiklBccins3nga1njIZJm','DgxPPdJMWm_VLUl5HImfU','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "rsvps" VALUES('_zYmKc9VskSBt8XCiQBSb','EjXm8uh6qTecmr1FfiX0A','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "rsvps" VALUES('kSJ2x9bL4waI7MPgOQ3Ne','cl0XFrbAvEpXPd3R7HMOd','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "rsvps" VALUES('K5G76P5ed4waeqL-U8WFC','w22sXfqYp_4K-jzZSK2C5','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "rsvps" VALUES('W5ew9B6cPiNqVSCSLxKjE','dHJVXduZbvyIn2x0gUolV','NjfILIKw5lpMwE8wIm9rw');
INSERT INTO "rsvps" VALUES('v9t7fXxlv4d1ZGea8aCBN','w22sXfqYp_4K-jzZSK2C5','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "rsvps" VALUES('lE4bbX7wvGzpQqXXGtIYd','xaKVSGCLL3BsGUopeo4vS','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "rsvps" VALUES('qTVvoZ0uqkP9t9MZbYoQY','LI3QOfdBHbjIr6v3k0nZr','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "rsvps" VALUES('suPqy_fInpCDMtnIzb_C_','tWKW2d-M87Rm5yJAOVfHw','tMTYBscBvrY3UzeU96E8X');
INSERT INTO "rsvps" VALUES('rbxPD3ITxQvpzzCAptvh-','EjXm8uh6qTecmr1FfiX0A','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('lO_x4MbPbmyUuQFy8xRFG','w22sXfqYp_4K-jzZSK2C5','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('ayhgq_7uHR0HduXF3W-Nl','dHJVXduZbvyIn2x0gUolV','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('NtMZM7hKCHJKNI7ct4rDZ','wbo61NcnAIXZUf_bbx3f-','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('b8dUqREuO1qDy7pSDIHVu','MSvAPIFXDq01HHS9JDgtN','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('hsiFiihDvarf4mBhQ3LuE','gX6i_M_dOtR5nk2-ggsZY','spQSZeX7xXbnA8PdFDn4t');
INSERT INTO "rsvps" VALUES('PPczXtnpPwM07CxFVSH-i','EjXm8uh6qTecmr1FfiX0A','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "rsvps" VALUES('MqNBgdDjnoeMK-XtAOEeT','cl0XFrbAvEpXPd3R7HMOd','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "rsvps" VALUES('NoqQQlcCA6fB1-M_bmrIE','AIKSgQ1zFCVvzU216S87n','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "rsvps" VALUES('hT8fb5bJdYdA_epLECArJ','dHJVXduZbvyIn2x0gUolV','wlcahNVNIVSc54-_Yj_6K');
INSERT INTO "rsvps" VALUES('LU7Qxa2dKmEILN61_DoeU','OaIVrOTsjyle0dW2xFa-R','-co1SIEViS_74Nne7F_tn');
INSERT INTO "rsvps" VALUES('caCsc3Q8_I6qLt-CARz09','coDqGOSo1L6mdIN4QZdFq','-co1SIEViS_74Nne7F_tn');
INSERT INTO "rsvps" VALUES('iMG_tQRjf5NzIrhJLxywX','w22sXfqYp_4K-jzZSK2C5','-co1SIEViS_74Nne7F_tn');
INSERT INTO "rsvps" VALUES('v3210sfOXl1G3JBDT7V4U','JSFbkDLV2SXffkLMUqsoI','-co1SIEViS_74Nne7F_tn');
INSERT INTO "rsvps" VALUES('TlauEzCwRNGay-t8gHCXE','tWKW2d-M87Rm5yJAOVfHw','-co1SIEViS_74Nne7F_tn');
INSERT INTO "rsvps" VALUES('-GC1Oyahp7iZ0w6Gw-6qi','W40VrZg5VhgM-p7tfCGis','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "rsvps" VALUES('dRxecTVO2aL_Gq6B8QZeF','dHJVXduZbvyIn2x0gUolV','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "rsvps" VALUES('NZrtiCkPwFiyTH9GRp7kf','MSvAPIFXDq01HHS9JDgtN','4gutz55F-QHGfFPFfdjwv');
INSERT INTO "rsvps" VALUES('X49T_0XZprbfNL4Cv7MIi','EjXm8uh6qTecmr1FfiX0A','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "rsvps" VALUES('lmP-niaudqTb98lRvrSx3','OaIVrOTsjyle0dW2xFa-R','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "rsvps" VALUES('4qiZDZF48MGkFc9yDZLRY','JSFbkDLV2SXffkLMUqsoI','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "rsvps" VALUES('jwewHfAt86PZXhst5cgtn','tWKW2d-M87Rm5yJAOVfHw','C0HmEuvkIpc1gF1giGvwa');
INSERT INTO "rsvps" VALUES('ESoLnJtD6KgE3gtS95EIU','EjXm8uh6qTecmr1FfiX0A','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "rsvps" VALUES('mCu-xWdZHZQ52F91SAhT5','W40VrZg5VhgM-p7tfCGis','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "rsvps" VALUES('1DXmi-Od5FdibIJh3_mB0','ZBmYh374V--830nt0XeiO','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "rsvps" VALUES('udpSFPvfhlKTpHrWzz9xp','W40VrZg5VhgM-p7tfCGis','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('LxlvXxvVn4LYhu_CI-OqI','ZBmYh374V--830nt0XeiO','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('L4x8873HgW1fhw7VzQr7k','q0nBxEMD9qmO2NiBK2Qmq','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('OMg-y47JbKETjxoAdWjza','JSFbkDLV2SXffkLMUqsoI','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('ypfirrna8TqS0VTsu67xO','wbo61NcnAIXZUf_bbx3f-','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('FfPseBjyGiU4D1K4LVw7k','tWKW2d-M87Rm5yJAOVfHw','zqrsPDdZpo61XLeStMzTP');
INSERT INTO "rsvps" VALUES('usHgrTJqjx2qtlICifU9L','EjXm8uh6qTecmr1FfiX0A','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "rsvps" VALUES('dW6mZPVHtY9qd_YSTwTx0','ZBmYh374V--830nt0XeiO','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "rsvps" VALUES('dRVSbkqmX22ivjpgRbT49','JSFbkDLV2SXffkLMUqsoI','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "rsvps" VALUES('GBqhSANlcauLCC9MK-aZK','wbo61NcnAIXZUf_bbx3f-','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "rsvps" VALUES('Lo8vipK7SQUxVjEzUzlq2','MSvAPIFXDq01HHS9JDgtN','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "rsvps" VALUES('Y-iEPbkjtQgxe1-PwfA7x','OaIVrOTsjyle0dW2xFa-R','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "rsvps" VALUES('Wocg5jZCwhYYpiRgR9wux','w22sXfqYp_4K-jzZSK2C5','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "rsvps" VALUES('Wbm8w0R7NuCyvLnxuBJLY','dHJVXduZbvyIn2x0gUolV','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "rsvps" VALUES('9pgyf4a4Xxvh7vs72MLNM','LI3QOfdBHbjIr6v3k0nZr','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "rsvps" VALUES('zGPiO9K1cyS-P1WnFT1Zn','tWKW2d-M87Rm5yJAOVfHw','ZEWIRXSjbqW_a6Cpdax7W');
INSERT INTO "rsvps" VALUES('3VjXWYJQPg3-A6wMlR7Ao','EjXm8uh6qTecmr1FfiX0A','XDWlCENodtX7WgvxQZt83');
INSERT INTO "rsvps" VALUES('V1KDWqLUMcVlCHRXW16kL','cl0XFrbAvEpXPd3R7HMOd','XDWlCENodtX7WgvxQZt83');
INSERT INTO "rsvps" VALUES('nINurf8wUpWZWu_Z9uGjA','OaIVrOTsjyle0dW2xFa-R','XDWlCENodtX7WgvxQZt83');
INSERT INTO "rsvps" VALUES('tIT7QGT2kuMpytr-JqEBr','coDqGOSo1L6mdIN4QZdFq','XDWlCENodtX7WgvxQZt83');
INSERT INTO "rsvps" VALUES('eZ5uf9xovpy-rIwqOhVXO','DgxPPdJMWm_VLUl5HImfU','XDWlCENodtX7WgvxQZt83');
INSERT INTO "rsvps" VALUES('mVGt7orouQjli13a__sg_','OaIVrOTsjyle0dW2xFa-R','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "rsvps" VALUES('Dcjyyxg30Uu9ZdETuP1Nc','w22sXfqYp_4K-jzZSK2C5','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "rsvps" VALUES('Mh2MF3AYhaOS0_bXfdJjw','LI3QOfdBHbjIr6v3k0nZr','n1q2bwTgEUk3zrC9wnF4-');
INSERT INTO "rsvps" VALUES('t1BIlKY0ownQ9V9KVqhkw','EjXm8uh6qTecmr1FfiX0A','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('3M67asDYbyShToKbvFrrF','OaIVrOTsjyle0dW2xFa-R','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('bUmhFh_2zsXFt4ML6yPas','coDqGOSo1L6mdIN4QZdFq','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('y4zUBMV-dkW-GPtkMCb5x','q0nBxEMD9qmO2NiBK2Qmq','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('cdQrKr-ikOxpl0TIulY42','xaKVSGCLL3BsGUopeo4vS','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('XqeL_c3UyT7VzxHHaxA8N','MSvAPIFXDq01HHS9JDgtN','sJ9x5dTy1G3354WUz-PBl');
INSERT INTO "rsvps" VALUES('ZHswvlFbWApgTsjeZsVRh','LI3QOfdBHbjIr6v3k0nZr','sJ9x5dTy1G3354WUz-PBl');
CREATE TABLE "session_hosts" (
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `guest_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_hosts" VALUES('_Q0f0ey7vKwNhRm1oei_W','KH3xfoA5aQ0nM18lsn-eI');
INSERT INTO "session_hosts" VALUES('slKwXUv402_mndQh7qY6G','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "session_hosts" VALUES('EjXm8uh6qTecmr1FfiX0A','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "session_hosts" VALUES('W40VrZg5VhgM-p7tfCGis','WBHNKMCNBmxx_MlTbJDAD');
INSERT INTO "session_hosts" VALUES('cl0XFrbAvEpXPd3R7HMOd','5i9i_3GcjIBT09rfaKCJZ');
INSERT INTO "session_hosts" VALUES('OaIVrOTsjyle0dW2xFa-R','CfYfMK2hR4gMF1bz13sRM');
INSERT INTO "session_hosts" VALUES('AIKSgQ1zFCVvzU216S87n','8Y4m2fOhOxAi1OQk9dv7m');
INSERT INTO "session_hosts" VALUES('ZBmYh374V--830nt0XeiO','MuwFQb2m-Ux3Zpq27RA5J');
INSERT INTO "session_hosts" VALUES('coDqGOSo1L6mdIN4QZdFq','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "session_hosts" VALUES('w22sXfqYp_4K-jzZSK2C5','YX2l5gVowbAVoY-CXUskE');
INSERT INTO "session_hosts" VALUES('q0nBxEMD9qmO2NiBK2Qmq','felLPYPQshS_hYQoeLaT_');
INSERT INTO "session_hosts" VALUES('dHJVXduZbvyIn2x0gUolV','ApV8IbWBVTVCMdBfaJ48D');
INSERT INTO "session_hosts" VALUES('JSFbkDLV2SXffkLMUqsoI','ErnEvyixQnkAvuVAh4bv6');
INSERT INTO "session_hosts" VALUES('wbo61NcnAIXZUf_bbx3f-','lRV_MMuPjX6NqTuMfEa2W');
INSERT INTO "session_hosts" VALUES('wbo61NcnAIXZUf_bbx3f-','QP-lEjBteOzXVC_SwiB38');
INSERT INTO "session_hosts" VALUES('xaKVSGCLL3BsGUopeo4vS','eUTS7VZUHxRztCDUt5rxe');
INSERT INTO "session_hosts" VALUES('MSvAPIFXDq01HHS9JDgtN','IswnQbyqCn7NbXRsGsD2W');
INSERT INTO "session_hosts" VALUES('sDcTHgpVk4j_lO2cO2UTT','jkh2TC9UTQ5jXzqfwLizh');
INSERT INTO "session_hosts" VALUES('LI3QOfdBHbjIr6v3k0nZr','W6jSzvl_D_aDAYrsRkkxU');
INSERT INTO "session_hosts" VALUES('DgxPPdJMWm_VLUl5HImfU','m69ckm5IrsgDvpRPsTKNV');
INSERT INTO "session_hosts" VALUES('gX6i_M_dOtR5nk2-ggsZY','dPXqkWHGi5eRm0TkIN1T_');
INSERT INTO "session_hosts" VALUES('tWKW2d-M87Rm5yJAOVfHw','IswnQbyqCn7NbXRsGsD2W');
CREATE TABLE "session_locations" (
	`session_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `location_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_locations" VALUES('_Q0f0ey7vKwNhRm1oei_W','loc-main-hall');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-main-hall');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-room-a');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-room-b');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-library');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-boardroom');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-auditorium');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-courtyard');
INSERT INTO "session_locations" VALUES('NV2C6M6fxu86gO4vdQNF7','loc-rooftop');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-main-hall');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-room-a');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-room-b');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-library');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-boardroom');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-auditorium');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-courtyard');
INSERT INTO "session_locations" VALUES('0Q3LBP--5rZKfa6aVnU8F','loc-rooftop');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-main-hall');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-room-a');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-room-b');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-library');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-boardroom');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-auditorium');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-courtyard');
INSERT INTO "session_locations" VALUES('-l4piIZIC5KF3tuWqgr-8','loc-rooftop');
INSERT INTO "session_locations" VALUES('slKwXUv402_mndQh7qY6G','loc-main-hall');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-main-hall');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-room-a');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-room-b');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-library');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-boardroom');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-auditorium');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-courtyard');
INSERT INTO "session_locations" VALUES('Cp58DxobUr7vV8XrNy-Bn','loc-rooftop');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-main-hall');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-room-a');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-room-b');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-library');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-boardroom');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-auditorium');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-courtyard');
INSERT INTO "session_locations" VALUES('CbD_lQxFTImHbluBtRJTe','loc-rooftop');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-main-hall');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-room-a');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-room-b');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-library');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-boardroom');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-auditorium');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-courtyard');
INSERT INTO "session_locations" VALUES('ekfRe6CEuGfmIEQhqk47I','loc-rooftop');
INSERT INTO "session_locations" VALUES('EjXm8uh6qTecmr1FfiX0A','loc-main-hall');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-main-hall');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-room-a');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-room-b');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-library');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-boardroom');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-auditorium');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-courtyard');
INSERT INTO "session_locations" VALUES('YrfcitKBSWdAWw7XkbW5N','loc-rooftop');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-main-hall');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-room-a');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-room-b');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-library');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-boardroom');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-auditorium');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-courtyard');
INSERT INTO "session_locations" VALUES('3hlgbjOZG_6lNN9WzIhF0','loc-rooftop');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-main-hall');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-room-a');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-room-b');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-library');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-boardroom');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-auditorium');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-courtyard');
INSERT INTO "session_locations" VALUES('VDuZHvThJc_X4NbTmU5vg','loc-rooftop');
INSERT INTO "session_locations" VALUES('W40VrZg5VhgM-p7tfCGis','loc-main-hall');
INSERT INTO "session_locations" VALUES('cl0XFrbAvEpXPd3R7HMOd','loc-room-a');
INSERT INTO "session_locations" VALUES('OaIVrOTsjyle0dW2xFa-R','loc-main-hall');
INSERT INTO "session_locations" VALUES('AIKSgQ1zFCVvzU216S87n','loc-room-b');
INSERT INTO "session_locations" VALUES('ZBmYh374V--830nt0XeiO','loc-room-a');
INSERT INTO "session_locations" VALUES('coDqGOSo1L6mdIN4QZdFq','loc-main-hall');
INSERT INTO "session_locations" VALUES('w22sXfqYp_4K-jzZSK2C5','loc-room-b');
INSERT INTO "session_locations" VALUES('q0nBxEMD9qmO2NiBK2Qmq','loc-room-a');
INSERT INTO "session_locations" VALUES('dHJVXduZbvyIn2x0gUolV','loc-main-hall');
INSERT INTO "session_locations" VALUES('dHJVXduZbvyIn2x0gUolV','loc-auditorium');
INSERT INTO "session_locations" VALUES('JSFbkDLV2SXffkLMUqsoI','loc-room-b');
INSERT INTO "session_locations" VALUES('wbo61NcnAIXZUf_bbx3f-','loc-main-hall');
INSERT INTO "session_locations" VALUES('xaKVSGCLL3BsGUopeo4vS','loc-room-b');
INSERT INTO "session_locations" VALUES('MSvAPIFXDq01HHS9JDgtN','loc-main-hall');
INSERT INTO "session_locations" VALUES('MSvAPIFXDq01HHS9JDgtN','loc-auditorium');
INSERT INTO "session_locations" VALUES('sDcTHgpVk4j_lO2cO2UTT','loc-main-hall');
INSERT INTO "session_locations" VALUES('LI3QOfdBHbjIr6v3k0nZr','loc-room-a');
INSERT INTO "session_locations" VALUES('DgxPPdJMWm_VLUl5HImfU','loc-room-b');
INSERT INTO "session_locations" VALUES('gX6i_M_dOtR5nk2-ggsZY','loc-main-hall');
INSERT INTO "session_locations" VALUES('tWKW2d-M87Rm5yJAOVfHw','loc-main-hall');
CREATE TABLE "session_proposals" (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer,
	`created_time` text NOT NULL, `updated_time` text, `cohost_wanted` integer DEFAULT false NOT NULL, `cohost_wanted_note` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_proposals" VALUES('UYPJ3fkjt1UHAdKXREiBK','CEeA7A1EGNKg4ElF256p4','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',30,'2026-10-04T09:58:27.988Z',NULL,1,'Someone who has run React in production at scale');
INSERT INTO "session_proposals" VALUES('rUJF_ebNtNzGqAhhd_PGk','CEeA7A1EGNKg4ElF256p4','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',NULL,'2026-10-04T09:58:27.988Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('ZI4tTb3VuZJcyAUmaSFAn','CEeA7A1EGNKg4ElF256p4','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',150,'2026-10-04T09:58:27.988Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('ICcJo2pffvCXidpRz0zyq','CEeA7A1EGNKg4ElF256p4','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',90,'2026-10-04T09:58:27.988Z',NULL,1,'A designer to cover the Figma side');
INSERT INTO "session_proposals" VALUES('EMsxgebwVfOy3qd2njMme','CEeA7A1EGNKg4ElF256p4','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-10-04T09:58:27.988Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('y8TI7FIiCwxedoEMBUA1v','CEeA7A1EGNKg4ElF256p4','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-10-04T09:58:27.988Z',NULL,1,'Anyone with a migration back to a monolith to share');
INSERT INTO "session_proposals" VALUES('nR2pYmS_qpHgKwPsp5fJ0','CEeA7A1EGNKg4ElF256p4','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-10-04T09:58:27.989Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('Aqly1yyLHYp53vTM7jGu-','CEeA7A1EGNKg4ElF256p4','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',120,'2026-10-04T09:58:27.989Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('7s3ekLnxZ7yrRUcXlVv0Q','CEeA7A1EGNKg4ElF256p4','Conference Alpha Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Alpha attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-10-04T09:58:27.989Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('KHJGncfmpIOKKjZPq_s5-','CEeA7A1EGNKg4ElF256p4','Networking & Coffee Chat: Connect with Conference Alpha Peers','An informal networking session designed to help Conference Alpha attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-10-04T09:58:27.989Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('8NHl7s0JlFxr_F0CkxGPR','CEeA7A1EGNKg4ElF256p4','Conference Alpha Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Alpha community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-10-04T09:58:27.989Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('XzLUY3ZT1PoqLsFSYrfQ9','ahNcYyOhWe34CsrVdaPJ2','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-10-04T09:58:27.989Z',NULL,1,'Someone who has run React in production at scale');
INSERT INTO "session_proposals" VALUES('IRdIF6ucRCHy7odPGwL3f','ahNcYyOhWe34CsrVdaPJ2','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',150,'2026-10-04T09:58:27.990Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('_Lp-VtIaxkNp5ZM5ixanO','ahNcYyOhWe34CsrVdaPJ2','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-10-04T09:58:27.990Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('cP0ba6i774S5qCg8uc6n7','ahNcYyOhWe34CsrVdaPJ2','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-10-04T09:58:27.990Z',NULL,1,'A designer to cover the Figma side');
INSERT INTO "session_proposals" VALUES('UKoot4sOyUe6YP2IfGjER','ahNcYyOhWe34CsrVdaPJ2','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',150,'2026-10-04T09:58:27.990Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('tRDOBUYKcwfqgulCzw648','ahNcYyOhWe34CsrVdaPJ2','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-10-04T09:58:27.990Z',NULL,1,'Anyone with a migration back to a monolith to share');
INSERT INTO "session_proposals" VALUES('JltQgTla40_fihoB2rESV','ahNcYyOhWe34CsrVdaPJ2','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-10-04T09:58:27.990Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('Fe5EIjrgEU1t8Pwqt9ALs','ahNcYyOhWe34CsrVdaPJ2','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('KZDhFQIrsJAY5E3iOwc5O','ahNcYyOhWe34CsrVdaPJ2','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('5VDz79kIyxq3iJHN9A3By','ahNcYyOhWe34CsrVdaPJ2','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('JdjzCDd5rVoNv4_X6ras0','ahNcYyOhWe34CsrVdaPJ2','Conference Beta Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Beta attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('e0Sojqsyahj00ZR4KSvBB','ahNcYyOhWe34CsrVdaPJ2','Networking & Coffee Chat: Connect with Conference Beta Peers','An informal networking session designed to help Conference Beta attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('Dxbzoa9-ddKxZ2rb_g1hl','ahNcYyOhWe34CsrVdaPJ2','Conference Beta Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Beta community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('fDfkj_A3YHQgf0wA11HnH','fHvlvt0u4u_ipYdqvYykd','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-10-04T09:58:27.991Z',NULL,1,'Someone who has run React in production at scale');
INSERT INTO "session_proposals" VALUES('-dHmMZU9vINwI8n4VJvBu','fHvlvt0u4u_ipYdqvYykd','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('gNM6bQ9rCnfXEgpCq2vZE','fHvlvt0u4u_ipYdqvYykd','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('T8eqMqOwRkIbvARD6buMu','fHvlvt0u4u_ipYdqvYykd','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-10-04T09:58:27.991Z',NULL,1,'A designer to cover the Figma side');
INSERT INTO "session_proposals" VALUES('zZJCYCZNXvcyaq66wpufI','fHvlvt0u4u_ipYdqvYykd','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('Kd31uzYlG2SJXTCxU4B6n','fHvlvt0u4u_ipYdqvYykd','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',60,'2026-10-04T09:58:27.991Z',NULL,1,'Anyone with a migration back to a monolith to share');
INSERT INTO "session_proposals" VALUES('0suS1VYA4ThBo69EmSnTO','fHvlvt0u4u_ipYdqvYykd','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('PUyTEB86fdKssANiw2Z5Z','fHvlvt0u4u_ipYdqvYykd','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('XGcZR0RBZshontgBN8zFz','fHvlvt0u4u_ipYdqvYykd','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('PqPhLTi8GZt6zd0LfzT7M','fHvlvt0u4u_ipYdqvYykd','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',90,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('drp02tnCSlduoXCGpBQh6','fHvlvt0u4u_ipYdqvYykd','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('gfn9WoF2ZeU7USBbQXEo3','fHvlvt0u4u_ipYdqvYykd','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.',90,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('B3EY2YoqGYU3Y4ao-cSbq','fHvlvt0u4u_ipYdqvYykd','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.',90,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('yK6ktOWVUW7DLCbTVofXO','fHvlvt0u4u_ipYdqvYykd','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('xLfbrVvLQHttdUs4Jsqfu','fHvlvt0u4u_ipYdqvYykd','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('w0eWIe1nz5Z32uXe8DUpN','fHvlvt0u4u_ipYdqvYykd','Conference Gamma Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Gamma attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('C6ZchP13LYh4q4gNLtPoG','fHvlvt0u4u_ipYdqvYykd','Networking & Coffee Chat: Connect with Conference Gamma Peers','An informal networking session designed to help Conference Gamma attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('_sukbTUQ8dxvRGFeeSesP','fHvlvt0u4u_ipYdqvYykd','Conference Gamma Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Gamma community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('ryCpFeoiOPkOxJzCY2U_V','fHvlvt0u4u_ipYdqvYykd','Writing Documentation People Actually Read','Most documentation is written once, in a hurry, by whoever shipped the feature. This session is about the opposite: treating docs as a product with readers, a first minute that has to land, and a maintenance cost you plan for.

We''ll look at real examples — a few good, several painfully bad — and pull out what separates them: task-shaped titles, examples before explanations, and the courage to delete a page.

Bring a page you''re unhappy with and we''ll rework it together.',60,'2026-10-04T09:58:27.991Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('qtz5Z7fj1rd3vSlfVl_Oj','fHvlvt0u4u_ipYdqvYykd','Your First Conference Talk: From Idea to Stage','You have something worth saying and no idea how to turn it into 30 minutes on a stage. Let''s fix that.

We''ll cover finding a topic that''s genuinely yours, writing an abstract that survives a review committee, building slides that support you instead of competing with you, and what to do when your demo dies in front of 200 people (it will, eventually).

Aimed at people who have *never* spoken before. No slides of my own — we work on yours.',90,'2026-10-04T09:58:27.992Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('WbgshTR3APoWRZQz2H1j5','fHvlvt0u4u_ipYdqvYykd','Ask Me Anything: Migrating a Legacy Monolith','**Looking for someone to host this!**

Several of us are staring down the same problem: a monolith that works, pays the bills, and is slowly becoming impossible to change. We''d love to hear from somebody who has actually come out the other side of a migration — what you''d do again, and what you''d never repeat.

If you''ve lived through one, please add yourself as host. An honest hour of war stories beats a polished talk.',60,'2026-10-04T09:58:27.992Z',NULL,0,NULL);
INSERT INTO "session_proposals" VALUES('eyc0neG2_gmhkOyLWgxGC','fHvlvt0u4u_ipYdqvYykd','Board Games for People Who Are Tired of Talking','By day three, everyone''s social battery is empty. This is a quiet room with a table, a stack of games, and no agenda.

Nobody has volunteered to bring the games yet — if you''re travelling with something short and easy to teach, add yourself as host and we''ll make it happen.',120,'2026-10-04T09:58:27.992Z',NULL,0,NULL);
CREATE TABLE "votes" (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`choice` text NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "votes" VALUES('AnnVfULPVq2HlTT0Ucq1L','XzLUY3ZT1PoqLsFSYrfQ9','KH3xfoA5aQ0nM18lsn-eI','maybe');
INSERT INTO "votes" VALUES('qqtw0TztKEK_Hd4B_RwS0','cP0ba6i774S5qCg8uc6n7','KH3xfoA5aQ0nM18lsn-eI','interested');
INSERT INTO "votes" VALUES('R4a47daSb9iPzlpr926fd','tRDOBUYKcwfqgulCzw648','KH3xfoA5aQ0nM18lsn-eI','maybe');
INSERT INTO "votes" VALUES('szkjFcEKDw26vvUcs-M-r','JltQgTla40_fihoB2rESV','KH3xfoA5aQ0nM18lsn-eI','maybe');
INSERT INTO "votes" VALUES('p7AxyoETLTmtBLfPQuX-n','KZDhFQIrsJAY5E3iOwc5O','KH3xfoA5aQ0nM18lsn-eI','interested');
INSERT INTO "votes" VALUES('woXG4Kb_n9LjjMVRxONg1','5VDz79kIyxq3iJHN9A3By','KH3xfoA5aQ0nM18lsn-eI','skip');
INSERT INTO "votes" VALUES('6Qmiel1CtDrl_WNutn9OP','IRdIF6ucRCHy7odPGwL3f','lRV_MMuPjX6NqTuMfEa2W','maybe');
INSERT INTO "votes" VALUES('ntLB3ZbOtd_AURU7SFwjG','cP0ba6i774S5qCg8uc6n7','lRV_MMuPjX6NqTuMfEa2W','interested');
INSERT INTO "votes" VALUES('KXlv8feOjhLVNtijmxoC2','UKoot4sOyUe6YP2IfGjER','lRV_MMuPjX6NqTuMfEa2W','skip');
INSERT INTO "votes" VALUES('moLuRJ_I3lMAtLDAjKgye','KZDhFQIrsJAY5E3iOwc5O','lRV_MMuPjX6NqTuMfEa2W','maybe');
INSERT INTO "votes" VALUES('4Vgu-Iy6CBGII6QsXOJ0l','UKoot4sOyUe6YP2IfGjER','IswnQbyqCn7NbXRsGsD2W','maybe');
INSERT INTO "votes" VALUES('OZqcvNHVNamfBOqY_lHeU','tRDOBUYKcwfqgulCzw648','IswnQbyqCn7NbXRsGsD2W','maybe');
INSERT INTO "votes" VALUES('54LfyHxub4MaYsJjaBE5v','_Lp-VtIaxkNp5ZM5ixanO','WBHNKMCNBmxx_MlTbJDAD','maybe');
INSERT INTO "votes" VALUES('TpV2RIU4_RsqEAtFeInv4','cP0ba6i774S5qCg8uc6n7','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('bYaBFg69j1o51pK3Tcg0g','JltQgTla40_fihoB2rESV','WBHNKMCNBmxx_MlTbJDAD','maybe');
INSERT INTO "votes" VALUES('xYO1rLB6Kqtbajr-eMxg9','Fe5EIjrgEU1t8Pwqt9ALs','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('QtnWA5raze_dmE_bnYw1x','KZDhFQIrsJAY5E3iOwc5O','WBHNKMCNBmxx_MlTbJDAD','skip');
INSERT INTO "votes" VALUES('Toa95q0WbT0qU6-j8Y5-Y','IRdIF6ucRCHy7odPGwL3f','Csy_BmrogZyATJ0Rc-yVO','skip');
INSERT INTO "votes" VALUES('cw3SQNfYbZi60Z0fuDop5','tRDOBUYKcwfqgulCzw648','Csy_BmrogZyATJ0Rc-yVO','interested');
INSERT INTO "votes" VALUES('KhAP6sZydFE3iuNcvg2We','XzLUY3ZT1PoqLsFSYrfQ9','5i9i_3GcjIBT09rfaKCJZ','maybe');
INSERT INTO "votes" VALUES('dryXACt3kZ0bRf_elLAwC','JltQgTla40_fihoB2rESV','5i9i_3GcjIBT09rfaKCJZ','maybe');
INSERT INTO "votes" VALUES('rbgZzMfx0iCJCchBvpzKG','KZDhFQIrsJAY5E3iOwc5O','5i9i_3GcjIBT09rfaKCJZ','skip');
INSERT INTO "votes" VALUES('oEryan0yPeYGSv2ylzP-s','XzLUY3ZT1PoqLsFSYrfQ9','7ZOGrOLuXLRiOuIcv9flt','skip');
INSERT INTO "votes" VALUES('sf3VlPw3AoKZNFZMy3fHG','IRdIF6ucRCHy7odPGwL3f','7ZOGrOLuXLRiOuIcv9flt','skip');
INSERT INTO "votes" VALUES('9aCbFprkDc8WhPysGzL0w','_Lp-VtIaxkNp5ZM5ixanO','7ZOGrOLuXLRiOuIcv9flt','skip');
INSERT INTO "votes" VALUES('bBMXsrybEKVOFt6l0uPwM','cP0ba6i774S5qCg8uc6n7','7ZOGrOLuXLRiOuIcv9flt','maybe');
INSERT INTO "votes" VALUES('7gnAsDAUC14XqIGPCxfNr','JltQgTla40_fihoB2rESV','7ZOGrOLuXLRiOuIcv9flt','maybe');
INSERT INTO "votes" VALUES('OnASjdedQwC07RGzAkkGk','Fe5EIjrgEU1t8Pwqt9ALs','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('NrJmqVjW6Jg2lZH5RMWJg','KZDhFQIrsJAY5E3iOwc5O','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('NyJRN765BFG1MwejnNzHh','5VDz79kIyxq3iJHN9A3By','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('PhEBSuBWNN5S71sEGyazC','XzLUY3ZT1PoqLsFSYrfQ9','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('b6f4AHcWp3ZaDgwoOuOPW','IRdIF6ucRCHy7odPGwL3f','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('lV7fvmXr3wfr7f_t6SGto','Fe5EIjrgEU1t8Pwqt9ALs','ApV8IbWBVTVCMdBfaJ48D','maybe');
INSERT INTO "votes" VALUES('PCt8WOehPiUQRibT1MZxs','5VDz79kIyxq3iJHN9A3By','ApV8IbWBVTVCMdBfaJ48D','skip');
INSERT INTO "votes" VALUES('ha6VQazka8fWuhONGhrov','_Lp-VtIaxkNp5ZM5ixanO','mansprtxW1DJ8XKr1ZxbH','skip');
INSERT INTO "votes" VALUES('lYsLJnd58-T1fo05Mds1-','tRDOBUYKcwfqgulCzw648','mansprtxW1DJ8XKr1ZxbH','maybe');
INSERT INTO "votes" VALUES('0gAZ8SGnzu1hLzkoYVpKA','5VDz79kIyxq3iJHN9A3By','mansprtxW1DJ8XKr1ZxbH','maybe');
INSERT INTO "votes" VALUES('DCNPbWkUsv8k07LicTPaW','IRdIF6ucRCHy7odPGwL3f','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('NiRum5EOlJf-O13k2SliM','_Lp-VtIaxkNp5ZM5ixanO','dPXqkWHGi5eRm0TkIN1T_','interested');
INSERT INTO "votes" VALUES('PPKSTYjERYYy3Yam2Yl75','cP0ba6i774S5qCg8uc6n7','dPXqkWHGi5eRm0TkIN1T_','interested');
INSERT INTO "votes" VALUES('n_j7SzkUKdVxvkWMVqHlO','UKoot4sOyUe6YP2IfGjER','dPXqkWHGi5eRm0TkIN1T_','skip');
INSERT INTO "votes" VALUES('NK4Y_0WLzhugdk1nOgol7','5VDz79kIyxq3iJHN9A3By','dPXqkWHGi5eRm0TkIN1T_','skip');
INSERT INTO "votes" VALUES('0M81YyOYzO29NATgsn9-a','Fe5EIjrgEU1t8Pwqt9ALs','W6jSzvl_D_aDAYrsRkkxU','maybe');
INSERT INTO "votes" VALUES('gBpP_NlhPBnCdCiGAwJiL','KZDhFQIrsJAY5E3iOwc5O','W6jSzvl_D_aDAYrsRkkxU','maybe');
INSERT INTO "votes" VALUES('QdJJ4pHg4JmwJF-lyM885','5VDz79kIyxq3iJHN9A3By','W6jSzvl_D_aDAYrsRkkxU','interested');
INSERT INTO "votes" VALUES('dgLqC-jRPUcGh0dTzC66e','XzLUY3ZT1PoqLsFSYrfQ9','t5DgVPLDS0n9Zfp1mwtgU','skip');
INSERT INTO "votes" VALUES('f9syxCsiEHsONW6TdIluV','IRdIF6ucRCHy7odPGwL3f','t5DgVPLDS0n9Zfp1mwtgU','skip');
INSERT INTO "votes" VALUES('Qk9NVJ3wm7zDLom0fr7IU','cP0ba6i774S5qCg8uc6n7','t5DgVPLDS0n9Zfp1mwtgU','skip');
INSERT INTO "votes" VALUES('6khYy4rMFGSxYHab6uJa6','UKoot4sOyUe6YP2IfGjER','t5DgVPLDS0n9Zfp1mwtgU','interested');
INSERT INTO "votes" VALUES('7aLSkt6GuvS_r6esLo4NQ','tRDOBUYKcwfqgulCzw648','t5DgVPLDS0n9Zfp1mwtgU','maybe');
INSERT INTO "votes" VALUES('TZwp7L_szKysufJxytR7x','JltQgTla40_fihoB2rESV','t5DgVPLDS0n9Zfp1mwtgU','interested');
INSERT INTO "votes" VALUES('ulY0icjuIJm2vu3cclbmd','_Lp-VtIaxkNp5ZM5ixanO','YX2l5gVowbAVoY-CXUskE','maybe');
INSERT INTO "votes" VALUES('vZG7WBdFopYn70YAwIAt8','cP0ba6i774S5qCg8uc6n7','YX2l5gVowbAVoY-CXUskE','skip');
INSERT INTO "votes" VALUES('-jXbfZvMHHnRE8Q5EfyXi','UKoot4sOyUe6YP2IfGjER','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('__X74t1HDt7a04mh3BQ52','tRDOBUYKcwfqgulCzw648','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('1GGv8czNqvK1NXI2pcnnf','KZDhFQIrsJAY5E3iOwc5O','m69ckm5IrsgDvpRPsTKNV','interested');
INSERT INTO "votes" VALUES('jGoujGh-4ZsxF-L3xEwkj','IRdIF6ucRCHy7odPGwL3f','mQSmJ-VPBgUK2gDV2ZITJ','maybe');
INSERT INTO "votes" VALUES('x5wiLkihLClNMnZ5Xp6rV','cP0ba6i774S5qCg8uc6n7','mQSmJ-VPBgUK2gDV2ZITJ','interested');
INSERT INTO "votes" VALUES('iTo8Bpkeuyo7MIxdr2G2k','tRDOBUYKcwfqgulCzw648','mQSmJ-VPBgUK2gDV2ZITJ','maybe');
INSERT INTO "votes" VALUES('f4n9nhqNqCgFo67HiVRYy','JltQgTla40_fihoB2rESV','mQSmJ-VPBgUK2gDV2ZITJ','interested');
INSERT INTO "votes" VALUES('Sr-VB9GnUqkU8l1nFRb2V','KZDhFQIrsJAY5E3iOwc5O','mQSmJ-VPBgUK2gDV2ZITJ','maybe');
INSERT INTO "votes" VALUES('gEXpBp7mzpnMvoXJ4tdEh','5VDz79kIyxq3iJHN9A3By','mQSmJ-VPBgUK2gDV2ZITJ','interested');
INSERT INTO "votes" VALUES('MnkHvzWfe1JNeMYSZgS_R','_Lp-VtIaxkNp5ZM5ixanO','felLPYPQshS_hYQoeLaT_','skip');
INSERT INTO "votes" VALUES('4srMjBFa-n4DXH2oIDM8H','cP0ba6i774S5qCg8uc6n7','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('ah7VrL_J2sdFceh65clRR','tRDOBUYKcwfqgulCzw648','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('0QTm4QhiJ-5bgRU0_fYWH','JltQgTla40_fihoB2rESV','felLPYPQshS_hYQoeLaT_','maybe');
INSERT INTO "votes" VALUES('FMIvMCtgVKOcR1e8ygFzA','Fe5EIjrgEU1t8Pwqt9ALs','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('5sdTlau4w8KzXsVCJ7AW4','KZDhFQIrsJAY5E3iOwc5O','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('W2Yp7BhB_OZ21xXZTGRrp','IRdIF6ucRCHy7odPGwL3f','HMR8n7D_C5zGxoQtoKE7D','skip');
INSERT INTO "votes" VALUES('PeTx7wdA3yFcSu79gOHs4','_Lp-VtIaxkNp5ZM5ixanO','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('Lh9QqFiAyENFAnoaAGrRi','cP0ba6i774S5qCg8uc6n7','HMR8n7D_C5zGxoQtoKE7D','skip');
INSERT INTO "votes" VALUES('JMdOL9dWXpoi_T5YN8AqJ','JltQgTla40_fihoB2rESV','HMR8n7D_C5zGxoQtoKE7D','maybe');
INSERT INTO "votes" VALUES('4D0gFRspfTVOjoS-Gxrni','KZDhFQIrsJAY5E3iOwc5O','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('o-winqU5U13882FGRcnK3','5VDz79kIyxq3iJHN9A3By','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('v9v7ow5EIpEH2p753_FF3','XzLUY3ZT1PoqLsFSYrfQ9','pJgBPKmbjinvqjurguDSG','interested');
INSERT INTO "votes" VALUES('6uP3GXoRtgOED4rjci-cB','IRdIF6ucRCHy7odPGwL3f','pJgBPKmbjinvqjurguDSG','interested');
INSERT INTO "votes" VALUES('tQZ0xb5ahZCd2Yc972pIM','Fe5EIjrgEU1t8Pwqt9ALs','pJgBPKmbjinvqjurguDSG','maybe');
INSERT INTO "votes" VALUES('lHuWYWTUdclU7xmRDYC4Y','KZDhFQIrsJAY5E3iOwc5O','pJgBPKmbjinvqjurguDSG','maybe');
INSERT INTO "votes" VALUES('G80sXgK_2ESv7bUS87I8l','XzLUY3ZT1PoqLsFSYrfQ9','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('RbcObb-Qu5H4dcFeX8HWv','IRdIF6ucRCHy7odPGwL3f','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('0n8cm8wDHc7R9XMs0fR23','_Lp-VtIaxkNp5ZM5ixanO','I3NLsVdMJlvCaUmloWg_m','skip');
INSERT INTO "votes" VALUES('-v5Ts4t6UWpYeU3CqmJBl','tRDOBUYKcwfqgulCzw648','I3NLsVdMJlvCaUmloWg_m','maybe');
INSERT INTO "votes" VALUES('0cwgYj6FkOucavLyh4aP0','KZDhFQIrsJAY5E3iOwc5O','I3NLsVdMJlvCaUmloWg_m','skip');
INSERT INTO "votes" VALUES('tHlKc_brmjMZEZynLc4W7','5VDz79kIyxq3iJHN9A3By','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('4e3VCly9N_jkySJmZF26T','XzLUY3ZT1PoqLsFSYrfQ9','jkh2TC9UTQ5jXzqfwLizh','maybe');
INSERT INTO "votes" VALUES('BqU6ph5aOK_xl6ypAGS6c','tRDOBUYKcwfqgulCzw648','jkh2TC9UTQ5jXzqfwLizh','maybe');
INSERT INTO "votes" VALUES('1XgLKAoRA0C0IHLfvZqmI','JltQgTla40_fihoB2rESV','jkh2TC9UTQ5jXzqfwLizh','interested');
INSERT INTO "votes" VALUES('5zmzsml0_zE-EDDi92skV','Fe5EIjrgEU1t8Pwqt9ALs','jkh2TC9UTQ5jXzqfwLizh','interested');
INSERT INTO "votes" VALUES('6f9IKKU-_60hODglOIrPD','5VDz79kIyxq3iJHN9A3By','jkh2TC9UTQ5jXzqfwLizh','interested');
INSERT INTO "votes" VALUES('7n3jsPPXKrv6F8puSOJYl','cP0ba6i774S5qCg8uc6n7','CfYfMK2hR4gMF1bz13sRM','skip');
INSERT INTO "votes" VALUES('8gWJIXp1AoH6OZ2-yZOsw','UKoot4sOyUe6YP2IfGjER','CfYfMK2hR4gMF1bz13sRM','interested');
INSERT INTO "votes" VALUES('kxeB5BrI1jzBDcjX6XMLI','JltQgTla40_fihoB2rESV','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('kYh_f6RadRVDAKurkIjBs','Fe5EIjrgEU1t8Pwqt9ALs','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('chmJFJ_S5oNcPKIU0qYCt','XzLUY3ZT1PoqLsFSYrfQ9','eUTS7VZUHxRztCDUt5rxe','maybe');
INSERT INTO "votes" VALUES('R_PoMCtoDd2OPpcJiieyJ','JltQgTla40_fihoB2rESV','eUTS7VZUHxRztCDUt5rxe','interested');
INSERT INTO "votes" VALUES('flnPJkgfGie-3Lz2ew3NR','KZDhFQIrsJAY5E3iOwc5O','eUTS7VZUHxRztCDUt5rxe','interested');
INSERT INTO "votes" VALUES('4_I4k1wEb4Wiz3-jCigqk','5VDz79kIyxq3iJHN9A3By','eUTS7VZUHxRztCDUt5rxe','skip');
INSERT INTO "votes" VALUES('14CiN9FUu9Jy18W_BOvqK','XzLUY3ZT1PoqLsFSYrfQ9','ErnEvyixQnkAvuVAh4bv6','interested');
INSERT INTO "votes" VALUES('NBgWByJxfSrCcAXHSHTDK','_Lp-VtIaxkNp5ZM5ixanO','ErnEvyixQnkAvuVAh4bv6','maybe');
INSERT INTO "votes" VALUES('6tLTeNQ5lSb7EiEQ-uF7s','tRDOBUYKcwfqgulCzw648','ErnEvyixQnkAvuVAh4bv6','interested');
INSERT INTO "votes" VALUES('WfqxTSkmo8tbbPpp1t7La','5VDz79kIyxq3iJHN9A3By','ErnEvyixQnkAvuVAh4bv6','skip');
INSERT INTO "votes" VALUES('omEkVaaPit7HTUQ6GZaiw','tRDOBUYKcwfqgulCzw648','CiX9cRrwJiGHFqt1To2vX','skip');
INSERT INTO "votes" VALUES('Jl0KYMoH-44OX70v4cxAP','KZDhFQIrsJAY5E3iOwc5O','CiX9cRrwJiGHFqt1To2vX','interested');
INSERT INTO "votes" VALUES('Iqf_DFEOQ2SkMYI64bRAE','5VDz79kIyxq3iJHN9A3By','CiX9cRrwJiGHFqt1To2vX','maybe');
INSERT INTO "votes" VALUES('lk_5zxqJWzfEMDDoR7hoH','XzLUY3ZT1PoqLsFSYrfQ9','HBaMqp-NtQJctBdn2oCbS','maybe');
INSERT INTO "votes" VALUES('6OqQuY5u4VhcGoprvbUhG','IRdIF6ucRCHy7odPGwL3f','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('7eUBzaEcj26EPXXSKteb5','tRDOBUYKcwfqgulCzw648','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('VdsrI579dMvX38yjIHzff','JltQgTla40_fihoB2rESV','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('e7wur0WQsD6NwSqo5PdQI','Fe5EIjrgEU1t8Pwqt9ALs','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('4zHyRM1KAc05Qys1GZ0st','KZDhFQIrsJAY5E3iOwc5O','HBaMqp-NtQJctBdn2oCbS','maybe');
INSERT INTO "votes" VALUES('bnDQU7FEqELBs8xrIE2T3','XzLUY3ZT1PoqLsFSYrfQ9','MuwFQb2m-Ux3Zpq27RA5J','maybe');
INSERT INTO "votes" VALUES('JNqfz84cW-OsFdBiQ8KU6','_Lp-VtIaxkNp5ZM5ixanO','MuwFQb2m-Ux3Zpq27RA5J','skip');
INSERT INTO "votes" VALUES('AxudnMswjXOasqlq__Abu','5VDz79kIyxq3iJHN9A3By','MuwFQb2m-Ux3Zpq27RA5J','maybe');
INSERT INTO "votes" VALUES('oPxKuvwQDUJ_y-GjrDQjN','IRdIF6ucRCHy7odPGwL3f','NjfILIKw5lpMwE8wIm9rw','maybe');
INSERT INTO "votes" VALUES('395X6hP87CrlmpBg5ojct','tRDOBUYKcwfqgulCzw648','NjfILIKw5lpMwE8wIm9rw','interested');
INSERT INTO "votes" VALUES('mNLAYL-3Sq5fhA2uzeiz1','Fe5EIjrgEU1t8Pwqt9ALs','NjfILIKw5lpMwE8wIm9rw','skip');
INSERT INTO "votes" VALUES('RJVvMcWR2ViUruAHr_pXG','XzLUY3ZT1PoqLsFSYrfQ9','tMTYBscBvrY3UzeU96E8X','interested');
INSERT INTO "votes" VALUES('ji2oEIy5iHjRHMzRh4_Bn','cP0ba6i774S5qCg8uc6n7','tMTYBscBvrY3UzeU96E8X','skip');
INSERT INTO "votes" VALUES('0rz_3YZouUuxoMpzYu9ja','JltQgTla40_fihoB2rESV','tMTYBscBvrY3UzeU96E8X','interested');
INSERT INTO "votes" VALUES('OeDiF90qLlDnnsqE_0x3N','XzLUY3ZT1PoqLsFSYrfQ9','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('VkXFcUNgey4m5lmg7BC01','_Lp-VtIaxkNp5ZM5ixanO','spQSZeX7xXbnA8PdFDn4t','interested');
INSERT INTO "votes" VALUES('laoqM-ahBTZaUTgLW-OWw','Fe5EIjrgEU1t8Pwqt9ALs','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('S1Na3ArdmNTgQw9hY1oTI','KZDhFQIrsJAY5E3iOwc5O','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('rHNv_fiO25Iepo7YmFTPQ','5VDz79kIyxq3iJHN9A3By','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('2-8za7Md9uWSx4bEdD-p3','XzLUY3ZT1PoqLsFSYrfQ9','wlcahNVNIVSc54-_Yj_6K','maybe');
INSERT INTO "votes" VALUES('GxqnhJQd1kJaG2eO86_nm','_Lp-VtIaxkNp5ZM5ixanO','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('E1eVExby4vlsGM5wDJpga','JltQgTla40_fihoB2rESV','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('x4HR84ohJRXhco6N2fopW','XzLUY3ZT1PoqLsFSYrfQ9','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('NhuUFP_t0bQcsHEh-euSL','_Lp-VtIaxkNp5ZM5ixanO','-co1SIEViS_74Nne7F_tn','maybe');
INSERT INTO "votes" VALUES('79eRabGtbyOtjCfHHAZT-','cP0ba6i774S5qCg8uc6n7','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('NoepF1woB2hV4epG-pZnc','tRDOBUYKcwfqgulCzw648','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('maSs-F4aPJi2YHqLYsKfi','XzLUY3ZT1PoqLsFSYrfQ9','4gutz55F-QHGfFPFfdjwv','interested');
INSERT INTO "votes" VALUES('W335c4mKQK9AxcFdulbmH','JltQgTla40_fihoB2rESV','4gutz55F-QHGfFPFfdjwv','maybe');
INSERT INTO "votes" VALUES('W_VG8d_YlPyp3PTlwkKG5','5VDz79kIyxq3iJHN9A3By','4gutz55F-QHGfFPFfdjwv','maybe');
INSERT INTO "votes" VALUES('SSVGyN3sKDQ48F8g6pl20','XzLUY3ZT1PoqLsFSYrfQ9','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('JoHOTubXgcbEoxlN-_siU','IRdIF6ucRCHy7odPGwL3f','C0HmEuvkIpc1gF1giGvwa','skip');
INSERT INTO "votes" VALUES('MG154Tr1ggIYVeYkcqtOH','UKoot4sOyUe6YP2IfGjER','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('dXGvm7eM9tX1XzGmepNC3','tRDOBUYKcwfqgulCzw648','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('5fHx6O-ODHT3JK1eo6rHk','Fe5EIjrgEU1t8Pwqt9ALs','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('OLnpjaoI0va_x6565Hhjw','KZDhFQIrsJAY5E3iOwc5O','C0HmEuvkIpc1gF1giGvwa','maybe');
INSERT INTO "votes" VALUES('fia5KM_Buv-wbhGVW-Us0','UKoot4sOyUe6YP2IfGjER','QP-lEjBteOzXVC_SwiB38','interested');
INSERT INTO "votes" VALUES('rhiuJoTWePzDxq7M0XSPF','XzLUY3ZT1PoqLsFSYrfQ9','zqrsPDdZpo61XLeStMzTP','skip');
INSERT INTO "votes" VALUES('w_IV6SVFNBxuSFYvPYBqN','IRdIF6ucRCHy7odPGwL3f','zqrsPDdZpo61XLeStMzTP','interested');
INSERT INTO "votes" VALUES('Xo5KhQOdIBM-od_KLut9p','Fe5EIjrgEU1t8Pwqt9ALs','zqrsPDdZpo61XLeStMzTP','skip');
INSERT INTO "votes" VALUES('gVvBMrEd7jvIDo9gNQsw6','KZDhFQIrsJAY5E3iOwc5O','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('k287kNMxNXdGhXFH4oad5','tRDOBUYKcwfqgulCzw648','8Y4m2fOhOxAi1OQk9dv7m','interested');
INSERT INTO "votes" VALUES('e3ZxtgxN_z-WES7tbkR94','Fe5EIjrgEU1t8Pwqt9ALs','8Y4m2fOhOxAi1OQk9dv7m','interested');
INSERT INTO "votes" VALUES('BOfAjsJEkCoExGO8lZ1ia','XzLUY3ZT1PoqLsFSYrfQ9','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('rsJLtC24BDLDCYvQw5NJU','cP0ba6i774S5qCg8uc6n7','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('lbs8tgGA6YfbRP74wHPvc','UKoot4sOyUe6YP2IfGjER','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('JmC866GxyY9_i6WNxiaoC','tRDOBUYKcwfqgulCzw648','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('zuxovoBDOepCt4c6nNBCh','Fe5EIjrgEU1t8Pwqt9ALs','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('HtDQd3-jb0yOppxKaDV5o','KZDhFQIrsJAY5E3iOwc5O','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('QcHGlWIxF_V-9IF2N5H81','cP0ba6i774S5qCg8uc6n7','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('RfVMy_GBlOX76QYbOs3Lb','JltQgTla40_fihoB2rESV','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('tqmsqCE946ZoONU98zUmx','_Lp-VtIaxkNp5ZM5ixanO','n1q2bwTgEUk3zrC9wnF4-','maybe');
INSERT INTO "votes" VALUES('349ytLUau1sZx0JDWuD_F','cP0ba6i774S5qCg8uc6n7','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('aVy_BPjOyN8Pp2b7xoZ5V','UKoot4sOyUe6YP2IfGjER','n1q2bwTgEUk3zrC9wnF4-','maybe');
INSERT INTO "votes" VALUES('vAoS0gyglm2bzEiv0YAmu','5VDz79kIyxq3iJHN9A3By','n1q2bwTgEUk3zrC9wnF4-','skip');
INSERT INTO "votes" VALUES('QadvnnD8pEG9kWdSm5BIT','XzLUY3ZT1PoqLsFSYrfQ9','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('8_oPzVXfHWTA5sSIEFDpa','IRdIF6ucRCHy7odPGwL3f','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('hK1MZMmEnacCT8dwYzS8G','_Lp-VtIaxkNp5ZM5ixanO','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('siacRj6UWGbm17wydWC0E','UKoot4sOyUe6YP2IfGjER','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('nndabaO66ocXAjafldmvD','tRDOBUYKcwfqgulCzw648','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('HEKF9NlPFjnDj72As4Srq','Fe5EIjrgEU1t8Pwqt9ALs','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('1Qhbo_EAJhd1BbFGJsKZt','5VDz79kIyxq3iJHN9A3By','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('MXV3_RK8dIXJp4eDFBYAA','-dHmMZU9vINwI8n4VJvBu','KH3xfoA5aQ0nM18lsn-eI','maybe');
INSERT INTO "votes" VALUES('NZz6Jnd2FNqvLlxs3zvuQ','gNM6bQ9rCnfXEgpCq2vZE','KH3xfoA5aQ0nM18lsn-eI','skip');
INSERT INTO "votes" VALUES('1ICgJNdW7vWvdqeJKpTWC','Kd31uzYlG2SJXTCxU4B6n','KH3xfoA5aQ0nM18lsn-eI','skip');
INSERT INTO "votes" VALUES('jZR8A-DjNl4e1uOkLJh6D','XGcZR0RBZshontgBN8zFz','KH3xfoA5aQ0nM18lsn-eI','maybe');
INSERT INTO "votes" VALUES('CV8P-VntvGNWNLSkCynCt','drp02tnCSlduoXCGpBQh6','KH3xfoA5aQ0nM18lsn-eI','skip');
INSERT INTO "votes" VALUES('0oBaC9di65UzsRUEL6zu4','yK6ktOWVUW7DLCbTVofXO','KH3xfoA5aQ0nM18lsn-eI','interested');
INSERT INTO "votes" VALUES('3jnDHUt1ONhadS5LwaPCT','ryCpFeoiOPkOxJzCY2U_V','KH3xfoA5aQ0nM18lsn-eI','interested');
INSERT INTO "votes" VALUES('9-EIibpTzv_lNUqj_zs8W','eyc0neG2_gmhkOyLWgxGC','KH3xfoA5aQ0nM18lsn-eI','skip');
INSERT INTO "votes" VALUES('_388m5-ySDp9QjPX52XQ_','-dHmMZU9vINwI8n4VJvBu','lRV_MMuPjX6NqTuMfEa2W','skip');
INSERT INTO "votes" VALUES('PQ0wHkc_-9Ru_IGfQOjH1','zZJCYCZNXvcyaq66wpufI','lRV_MMuPjX6NqTuMfEa2W','skip');
INSERT INTO "votes" VALUES('xvxzkKUv6TsA79RrKKSKu','Kd31uzYlG2SJXTCxU4B6n','lRV_MMuPjX6NqTuMfEa2W','skip');
INSERT INTO "votes" VALUES('8zCcIdU2j_CsPaEXeBzvF','XGcZR0RBZshontgBN8zFz','lRV_MMuPjX6NqTuMfEa2W','interested');
INSERT INTO "votes" VALUES('fMd29VH7v_7L_I576VIC1','yK6ktOWVUW7DLCbTVofXO','lRV_MMuPjX6NqTuMfEa2W','skip');
INSERT INTO "votes" VALUES('weW4DqR3SRlwepQUQBtaW','qtz5Z7fj1rd3vSlfVl_Oj','lRV_MMuPjX6NqTuMfEa2W','maybe');
INSERT INTO "votes" VALUES('NQojR2RJ3oKNnjuGMhBWW','T8eqMqOwRkIbvARD6buMu','IswnQbyqCn7NbXRsGsD2W','maybe');
INSERT INTO "votes" VALUES('354lpvRYbksuuQ74j92D-','Kd31uzYlG2SJXTCxU4B6n','IswnQbyqCn7NbXRsGsD2W','interested');
INSERT INTO "votes" VALUES('pJATJxRXQ8OMDh4fQ5rkZ','PUyTEB86fdKssANiw2Z5Z','IswnQbyqCn7NbXRsGsD2W','interested');
INSERT INTO "votes" VALUES('ownLSrE5-mOoNJxbOxiiP','PqPhLTi8GZt6zd0LfzT7M','IswnQbyqCn7NbXRsGsD2W','skip');
INSERT INTO "votes" VALUES('_LDkqt4BfmcuxiPmZTHwy','gfn9WoF2ZeU7USBbQXEo3','IswnQbyqCn7NbXRsGsD2W','maybe');
INSERT INTO "votes" VALUES('F2WwFm418T0N8ei1s-hnd','B3EY2YoqGYU3Y4ao-cSbq','IswnQbyqCn7NbXRsGsD2W','skip');
INSERT INTO "votes" VALUES('94_-LwcGCcTycgYqccMxa','ryCpFeoiOPkOxJzCY2U_V','IswnQbyqCn7NbXRsGsD2W','skip');
INSERT INTO "votes" VALUES('87UiYoibYADfuyTCZGWVs','eyc0neG2_gmhkOyLWgxGC','IswnQbyqCn7NbXRsGsD2W','skip');
INSERT INTO "votes" VALUES('CQBv2HDJenx7MM18KanN-','fDfkj_A3YHQgf0wA11HnH','WBHNKMCNBmxx_MlTbJDAD','skip');
INSERT INTO "votes" VALUES('8Y31Tniqs5VAHBsKT4B_X','gNM6bQ9rCnfXEgpCq2vZE','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('dMHmzu7UXhvrbd4GcmjRU','zZJCYCZNXvcyaq66wpufI','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('pWnPF0Pa_tJOy1Y_7KzfG','Kd31uzYlG2SJXTCxU4B6n','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('-ZoMmF5u49ceaEInrWbj7','PUyTEB86fdKssANiw2Z5Z','WBHNKMCNBmxx_MlTbJDAD','maybe');
INSERT INTO "votes" VALUES('sHCKpUQWLM5tzGqVbiugM','drp02tnCSlduoXCGpBQh6','WBHNKMCNBmxx_MlTbJDAD','maybe');
INSERT INTO "votes" VALUES('gc6F03hSfHJO8TntE1NA6','gfn9WoF2ZeU7USBbQXEo3','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('AXuAjQTD6qZxOkZ0-GEPV','ryCpFeoiOPkOxJzCY2U_V','WBHNKMCNBmxx_MlTbJDAD','maybe');
INSERT INTO "votes" VALUES('hBnoBM8Zu5-kdmmEjYH8P','eyc0neG2_gmhkOyLWgxGC','WBHNKMCNBmxx_MlTbJDAD','interested');
INSERT INTO "votes" VALUES('sAqJ6pK6hgq-LPfC3i1Rz','gNM6bQ9rCnfXEgpCq2vZE','Csy_BmrogZyATJ0Rc-yVO','maybe');
INSERT INTO "votes" VALUES('ZLxWSJBCrrl-I80EVTTTk','zZJCYCZNXvcyaq66wpufI','Csy_BmrogZyATJ0Rc-yVO','maybe');
INSERT INTO "votes" VALUES('1woIKoka3VHIVy4vIBLbI','drp02tnCSlduoXCGpBQh6','Csy_BmrogZyATJ0Rc-yVO','interested');
INSERT INTO "votes" VALUES('YGmxMH9CNWlai28ObjK_Y','qtz5Z7fj1rd3vSlfVl_Oj','Csy_BmrogZyATJ0Rc-yVO','interested');
INSERT INTO "votes" VALUES('MfgfKHapSLY7HWaWXeRIO','WbgshTR3APoWRZQz2H1j5','Csy_BmrogZyATJ0Rc-yVO','interested');
INSERT INTO "votes" VALUES('tDB-WvT7kNTZwGx6-cEnz','Kd31uzYlG2SJXTCxU4B6n','5i9i_3GcjIBT09rfaKCJZ','interested');
INSERT INTO "votes" VALUES('9P9mbINHP22y2cwgpjTur','PUyTEB86fdKssANiw2Z5Z','5i9i_3GcjIBT09rfaKCJZ','maybe');
INSERT INTO "votes" VALUES('UpIXJhRuWUJKzezuJMEnT','XGcZR0RBZshontgBN8zFz','5i9i_3GcjIBT09rfaKCJZ','skip');
INSERT INTO "votes" VALUES('7QA1WMVkmXu_4GSlDzosZ','PqPhLTi8GZt6zd0LfzT7M','5i9i_3GcjIBT09rfaKCJZ','interested');
INSERT INTO "votes" VALUES('AaMd5BeqIc58gJXAganeF','drp02tnCSlduoXCGpBQh6','5i9i_3GcjIBT09rfaKCJZ','skip');
INSERT INTO "votes" VALUES('xsMlWRC2ulji0gSLCfmkE','qtz5Z7fj1rd3vSlfVl_Oj','5i9i_3GcjIBT09rfaKCJZ','maybe');
INSERT INTO "votes" VALUES('wJclv_HDmBrLjzB3NJAbU','WbgshTR3APoWRZQz2H1j5','5i9i_3GcjIBT09rfaKCJZ','maybe');
INSERT INTO "votes" VALUES('kzNpz09ia7HmgPVcO83oq','gNM6bQ9rCnfXEgpCq2vZE','7ZOGrOLuXLRiOuIcv9flt','skip');
INSERT INTO "votes" VALUES('vUxKcXI91n1t1j0yv97cg','T8eqMqOwRkIbvARD6buMu','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('YWv42DdohsxyglJsddC-O','Kd31uzYlG2SJXTCxU4B6n','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('Znx_iEQZXyzAc27pzwGiw','0suS1VYA4ThBo69EmSnTO','7ZOGrOLuXLRiOuIcv9flt','maybe');
INSERT INTO "votes" VALUES('UzuvSORLLk2zTDvX4jsXe','drp02tnCSlduoXCGpBQh6','7ZOGrOLuXLRiOuIcv9flt','maybe');
INSERT INTO "votes" VALUES('k6VTVeDkoGHeaBDpAY0vq','B3EY2YoqGYU3Y4ao-cSbq','7ZOGrOLuXLRiOuIcv9flt','interested');
INSERT INTO "votes" VALUES('5k5amCfVB_OwsKqRe_tuq','eyc0neG2_gmhkOyLWgxGC','7ZOGrOLuXLRiOuIcv9flt','maybe');
INSERT INTO "votes" VALUES('tgmWk3ySKAPtGpzqJgHh7','gNM6bQ9rCnfXEgpCq2vZE','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('NbthJLFXgY6FgKKNbucs4','T8eqMqOwRkIbvARD6buMu','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('9ufG8qSnTkVK7XWYsUdzg','zZJCYCZNXvcyaq66wpufI','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('MXH5LyH6odrdstmBqnvqz','Kd31uzYlG2SJXTCxU4B6n','ApV8IbWBVTVCMdBfaJ48D','maybe');
INSERT INTO "votes" VALUES('mfqas1qMb5UPmq2A_4MoX','PUyTEB86fdKssANiw2Z5Z','ApV8IbWBVTVCMdBfaJ48D','skip');
INSERT INTO "votes" VALUES('Qh7CuUFWKKe-KiKKa8URA','drp02tnCSlduoXCGpBQh6','ApV8IbWBVTVCMdBfaJ48D','interested');
INSERT INTO "votes" VALUES('oI-GX1xGC4fH-364hKNwA','B3EY2YoqGYU3Y4ao-cSbq','ApV8IbWBVTVCMdBfaJ48D','maybe');
INSERT INTO "votes" VALUES('YOC5E7O46h7vtJuCAUJoM','ryCpFeoiOPkOxJzCY2U_V','ApV8IbWBVTVCMdBfaJ48D','maybe');
INSERT INTO "votes" VALUES('QLbJxVTgxg2OTbp92KZTu','WbgshTR3APoWRZQz2H1j5','ApV8IbWBVTVCMdBfaJ48D','maybe');
INSERT INTO "votes" VALUES('r7vpPe0iV_vheNB6eu36F','0suS1VYA4ThBo69EmSnTO','mansprtxW1DJ8XKr1ZxbH','skip');
INSERT INTO "votes" VALUES('EocG1YHgCH8H2dYRhUhcp','PUyTEB86fdKssANiw2Z5Z','mansprtxW1DJ8XKr1ZxbH','maybe');
INSERT INTO "votes" VALUES('aH__ztEzNSUBcMAycWkTS','XGcZR0RBZshontgBN8zFz','mansprtxW1DJ8XKr1ZxbH','interested');
INSERT INTO "votes" VALUES('vxF9WgMMe9e1oJMeQrtSA','PqPhLTi8GZt6zd0LfzT7M','mansprtxW1DJ8XKr1ZxbH','interested');
INSERT INTO "votes" VALUES('Lx8DESOm9f4iSOqPoGezP','drp02tnCSlduoXCGpBQh6','mansprtxW1DJ8XKr1ZxbH','interested');
INSERT INTO "votes" VALUES('NVBkV3OWYr93ue0HorR4q','gfn9WoF2ZeU7USBbQXEo3','mansprtxW1DJ8XKr1ZxbH','interested');
INSERT INTO "votes" VALUES('OerwncykAnjt9oTDhwRFV','xLfbrVvLQHttdUs4Jsqfu','mansprtxW1DJ8XKr1ZxbH','maybe');
INSERT INTO "votes" VALUES('7porrhs72ulSo53kxTwJI','qtz5Z7fj1rd3vSlfVl_Oj','mansprtxW1DJ8XKr1ZxbH','maybe');
INSERT INTO "votes" VALUES('uCBklmXAolByDYUoE5M_c','eyc0neG2_gmhkOyLWgxGC','mansprtxW1DJ8XKr1ZxbH','interested');
INSERT INTO "votes" VALUES('NVrLXbVXHyJskGjplzH_7','fDfkj_A3YHQgf0wA11HnH','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('h3DME8BwSDmxGK84I6lhD','-dHmMZU9vINwI8n4VJvBu','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('82VUW2RuHFsSAw8LB2Fhn','gNM6bQ9rCnfXEgpCq2vZE','dPXqkWHGi5eRm0TkIN1T_','interested');
INSERT INTO "votes" VALUES('Hj-UUtnf7nR2xUGAl1V1M','Kd31uzYlG2SJXTCxU4B6n','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('FXeuojPdeSZrEfInU-pNI','PqPhLTi8GZt6zd0LfzT7M','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('2sL83_jreBruThKZPWdLw','qtz5Z7fj1rd3vSlfVl_Oj','dPXqkWHGi5eRm0TkIN1T_','maybe');
INSERT INTO "votes" VALUES('JbpaGHjQR6BOrvpzzWiQs','zZJCYCZNXvcyaq66wpufI','W6jSzvl_D_aDAYrsRkkxU','maybe');
INSERT INTO "votes" VALUES('SswboeNzfHdobOQg9yYCB','0suS1VYA4ThBo69EmSnTO','W6jSzvl_D_aDAYrsRkkxU','maybe');
INSERT INTO "votes" VALUES('yEXMqQlPOmwH-1eFKYyZM','XGcZR0RBZshontgBN8zFz','W6jSzvl_D_aDAYrsRkkxU','skip');
INSERT INTO "votes" VALUES('X_YEqrLyat7x-Zgv1FigR','gfn9WoF2ZeU7USBbQXEo3','W6jSzvl_D_aDAYrsRkkxU','interested');
INSERT INTO "votes" VALUES('FDgMDkP1yzqm4hGn3S25l','B3EY2YoqGYU3Y4ao-cSbq','W6jSzvl_D_aDAYrsRkkxU','interested');
INSERT INTO "votes" VALUES('H1f3yZPWaasO0SMWJFETO','yK6ktOWVUW7DLCbTVofXO','W6jSzvl_D_aDAYrsRkkxU','skip');
INSERT INTO "votes" VALUES('CkZRgIag7ADi7aBujN1bG','xLfbrVvLQHttdUs4Jsqfu','W6jSzvl_D_aDAYrsRkkxU','skip');
INSERT INTO "votes" VALUES('WL_K0hqz25qSV4AzuFdhW','qtz5Z7fj1rd3vSlfVl_Oj','W6jSzvl_D_aDAYrsRkkxU','interested');
INSERT INTO "votes" VALUES('DMU7SlW1r0alodxa9jkJk','WbgshTR3APoWRZQz2H1j5','W6jSzvl_D_aDAYrsRkkxU','interested');
INSERT INTO "votes" VALUES('XVka7wUxH1rsplckxZFBr','gNM6bQ9rCnfXEgpCq2vZE','t5DgVPLDS0n9Zfp1mwtgU','interested');
INSERT INTO "votes" VALUES('_py1oZPJ4tquqRm2cPs_3','yK6ktOWVUW7DLCbTVofXO','t5DgVPLDS0n9Zfp1mwtgU','maybe');
INSERT INTO "votes" VALUES('4Ot4bsQShu2ApjaN8R5hu','eyc0neG2_gmhkOyLWgxGC','t5DgVPLDS0n9Zfp1mwtgU','skip');
INSERT INTO "votes" VALUES('vhELyh4uf0DUMrxPi2zHc','zZJCYCZNXvcyaq66wpufI','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('RemssJiFLQgmuNLcKW7u_','Kd31uzYlG2SJXTCxU4B6n','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('53_Z7aCJ_YZSiPMsWSDVW','PUyTEB86fdKssANiw2Z5Z','YX2l5gVowbAVoY-CXUskE','maybe');
INSERT INTO "votes" VALUES('jyhovvpd1D_nsFJU3kbql','B3EY2YoqGYU3Y4ao-cSbq','YX2l5gVowbAVoY-CXUskE','maybe');
INSERT INTO "votes" VALUES('bgwkLDFD6TeqPM1IMDR5Y','xLfbrVvLQHttdUs4Jsqfu','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('9EY0b27qfbycIWDXDaSbN','ryCpFeoiOPkOxJzCY2U_V','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('YCqZrMZuFxFgn2l38ZHxb','WbgshTR3APoWRZQz2H1j5','YX2l5gVowbAVoY-CXUskE','skip');
INSERT INTO "votes" VALUES('axlaY3vOmkdAdcLVlhEaq','eyc0neG2_gmhkOyLWgxGC','YX2l5gVowbAVoY-CXUskE','interested');
INSERT INTO "votes" VALUES('sOiSSFd7dYqgmzdkiLcye','fDfkj_A3YHQgf0wA11HnH','m69ckm5IrsgDvpRPsTKNV','interested');
INSERT INTO "votes" VALUES('-h4_FQ38DBfJIlnGKgxQd','-dHmMZU9vINwI8n4VJvBu','m69ckm5IrsgDvpRPsTKNV','skip');
INSERT INTO "votes" VALUES('5G_K1j3cnkn3AL0UfJ-qo','Kd31uzYlG2SJXTCxU4B6n','m69ckm5IrsgDvpRPsTKNV','skip');
INSERT INTO "votes" VALUES('hkwEDOugw_7nDgHx8GjWg','0suS1VYA4ThBo69EmSnTO','m69ckm5IrsgDvpRPsTKNV','maybe');
INSERT INTO "votes" VALUES('2eTTu_cuhPGxD5ueQ4UxT','gfn9WoF2ZeU7USBbQXEo3','m69ckm5IrsgDvpRPsTKNV','maybe');
INSERT INTO "votes" VALUES('2i7_BX0eObkRUrKwQD42d','xLfbrVvLQHttdUs4Jsqfu','m69ckm5IrsgDvpRPsTKNV','interested');
INSERT INTO "votes" VALUES('tsID-ixhFv_KYd6DSwD4j','ryCpFeoiOPkOxJzCY2U_V','m69ckm5IrsgDvpRPsTKNV','maybe');
INSERT INTO "votes" VALUES('6QtQfQTYYLy9jRXWUYWPr','qtz5Z7fj1rd3vSlfVl_Oj','m69ckm5IrsgDvpRPsTKNV','maybe');
INSERT INTO "votes" VALUES('zusMRn8kfdUpOt0UFvzaK','WbgshTR3APoWRZQz2H1j5','m69ckm5IrsgDvpRPsTKNV','skip');
INSERT INTO "votes" VALUES('5uRtfg-QghuJP8z4fJ9Jt','eyc0neG2_gmhkOyLWgxGC','m69ckm5IrsgDvpRPsTKNV','maybe');
INSERT INTO "votes" VALUES('Hph24tYLfiFB58TSuWwCf','zZJCYCZNXvcyaq66wpufI','mQSmJ-VPBgUK2gDV2ZITJ','skip');
INSERT INTO "votes" VALUES('pPwXxl5hNgNFvTLr1FgVi','0suS1VYA4ThBo69EmSnTO','mQSmJ-VPBgUK2gDV2ZITJ','maybe');
INSERT INTO "votes" VALUES('aK4nIjZnp3V5AXpmKAMwv','PqPhLTi8GZt6zd0LfzT7M','mQSmJ-VPBgUK2gDV2ZITJ','skip');
INSERT INTO "votes" VALUES('JPsHPFFGzem_Jej9w-9jE','drp02tnCSlduoXCGpBQh6','mQSmJ-VPBgUK2gDV2ZITJ','skip');
INSERT INTO "votes" VALUES('f3QKgudea6pl_6RAGDYwg','yK6ktOWVUW7DLCbTVofXO','mQSmJ-VPBgUK2gDV2ZITJ','interested');
INSERT INTO "votes" VALUES('a3keAAgu-peTPN9VIcdR5','xLfbrVvLQHttdUs4Jsqfu','mQSmJ-VPBgUK2gDV2ZITJ','interested');
INSERT INTO "votes" VALUES('A7hUmeag-rGhN9hA60wsW','WbgshTR3APoWRZQz2H1j5','mQSmJ-VPBgUK2gDV2ZITJ','skip');
INSERT INTO "votes" VALUES('1A-NENjsfh0xfn84uLKFQ','T8eqMqOwRkIbvARD6buMu','felLPYPQshS_hYQoeLaT_','maybe');
INSERT INTO "votes" VALUES('hMxFRFYqUwMoVRcl90eg_','zZJCYCZNXvcyaq66wpufI','felLPYPQshS_hYQoeLaT_','maybe');
INSERT INTO "votes" VALUES('vBeLlc1XDWbbO22TwOf1e','Kd31uzYlG2SJXTCxU4B6n','felLPYPQshS_hYQoeLaT_','skip');
INSERT INTO "votes" VALUES('NsHQrwruCXjvCnGxeRlAQ','XGcZR0RBZshontgBN8zFz','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('MRQRTd2CGOw2wU6xWrKF6','PqPhLTi8GZt6zd0LfzT7M','felLPYPQshS_hYQoeLaT_','interested');
INSERT INTO "votes" VALUES('K7tJAnv4KZXQfjfHPuFyI','qtz5Z7fj1rd3vSlfVl_Oj','felLPYPQshS_hYQoeLaT_','maybe');
INSERT INTO "votes" VALUES('ZiKDOYZyy4LUC4YjxDP8L','PUyTEB86fdKssANiw2Z5Z','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('cQrXOgeCEoG0omDBwA3AS','XGcZR0RBZshontgBN8zFz','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('TxrQDE4XfYk8gT26ny1Y2','B3EY2YoqGYU3Y4ao-cSbq','HMR8n7D_C5zGxoQtoKE7D','maybe');
INSERT INTO "votes" VALUES('7NXKYLDcuC4omx9nzqg2Y','qtz5Z7fj1rd3vSlfVl_Oj','HMR8n7D_C5zGxoQtoKE7D','interested');
INSERT INTO "votes" VALUES('HQ9U0rT7XjMSqTDuZtdUQ','XGcZR0RBZshontgBN8zFz','pJgBPKmbjinvqjurguDSG','maybe');
INSERT INTO "votes" VALUES('u3AK7-I9pCBMMFSgwgYYN','PqPhLTi8GZt6zd0LfzT7M','pJgBPKmbjinvqjurguDSG','interested');
INSERT INTO "votes" VALUES('4tkmv4fXE8-hi2ZJEjKPr','B3EY2YoqGYU3Y4ao-cSbq','pJgBPKmbjinvqjurguDSG','interested');
INSERT INTO "votes" VALUES('Hw5vNKL7HNWTX678OoeIz','yK6ktOWVUW7DLCbTVofXO','pJgBPKmbjinvqjurguDSG','skip');
INSERT INTO "votes" VALUES('pA6RyVWueJjWw4RQgwAf0','xLfbrVvLQHttdUs4Jsqfu','pJgBPKmbjinvqjurguDSG','skip');
INSERT INTO "votes" VALUES('tcQ6wX3v5IPPe5XNRC_5h','-dHmMZU9vINwI8n4VJvBu','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('90DRKJ5FbC9MV0cO0v6at','zZJCYCZNXvcyaq66wpufI','I3NLsVdMJlvCaUmloWg_m','maybe');
INSERT INTO "votes" VALUES('Evrp-Q1J0eGZxe3brB3ol','Kd31uzYlG2SJXTCxU4B6n','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('z0-hMaL-rITKxydiEzyTb','yK6ktOWVUW7DLCbTVofXO','I3NLsVdMJlvCaUmloWg_m','interested');
INSERT INTO "votes" VALUES('EI9nM8-IXxOZIX54T_IVK','ryCpFeoiOPkOxJzCY2U_V','I3NLsVdMJlvCaUmloWg_m','skip');
INSERT INTO "votes" VALUES('tyo6uEC-XJrFrhT2Yuley','fDfkj_A3YHQgf0wA11HnH','jkh2TC9UTQ5jXzqfwLizh','skip');
INSERT INTO "votes" VALUES('rMJh3bU4VqNYkC-ywNbtu','-dHmMZU9vINwI8n4VJvBu','jkh2TC9UTQ5jXzqfwLizh','maybe');
INSERT INTO "votes" VALUES('ixeg2zQy-9fcjjMnghcvO','0suS1VYA4ThBo69EmSnTO','jkh2TC9UTQ5jXzqfwLizh','skip');
INSERT INTO "votes" VALUES('xXS8PwiXKTHEjRrP2FL4Y','XGcZR0RBZshontgBN8zFz','jkh2TC9UTQ5jXzqfwLizh','interested');
INSERT INTO "votes" VALUES('GMJwzq-yjmhcatf-DHVtF','B3EY2YoqGYU3Y4ao-cSbq','jkh2TC9UTQ5jXzqfwLizh','skip');
INSERT INTO "votes" VALUES('W5ppthaERwbfJNc0XMriV','xLfbrVvLQHttdUs4Jsqfu','jkh2TC9UTQ5jXzqfwLizh','skip');
INSERT INTO "votes" VALUES('_OPXufphPZNwBM-ZLxPm1','eyc0neG2_gmhkOyLWgxGC','jkh2TC9UTQ5jXzqfwLizh','maybe');
INSERT INTO "votes" VALUES('ZNL2I5o8pIuTxueqUWo8k','-dHmMZU9vINwI8n4VJvBu','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('7Nv73NRtECIrxFEEFy7S_','gNM6bQ9rCnfXEgpCq2vZE','CfYfMK2hR4gMF1bz13sRM','interested');
INSERT INTO "votes" VALUES('WDX726ZMEPL3nj-rAh6kG','PqPhLTi8GZt6zd0LfzT7M','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('y4rruaCrJjvhrnAiRF_My','drp02tnCSlduoXCGpBQh6','CfYfMK2hR4gMF1bz13sRM','interested');
INSERT INTO "votes" VALUES('BGEmZ_EGERs-3e48FgRUr','gfn9WoF2ZeU7USBbQXEo3','CfYfMK2hR4gMF1bz13sRM','skip');
INSERT INTO "votes" VALUES('lL3KsQzGGz0emyIOCi87p','qtz5Z7fj1rd3vSlfVl_Oj','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('PhhcE_eFm9hhvGZLlH_gs','WbgshTR3APoWRZQz2H1j5','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('AUXz0K5V7Hy2_Bm-Nl3_G','eyc0neG2_gmhkOyLWgxGC','CfYfMK2hR4gMF1bz13sRM','maybe');
INSERT INTO "votes" VALUES('7u6REZvxpUQPCrDdmoO87','fDfkj_A3YHQgf0wA11HnH','eUTS7VZUHxRztCDUt5rxe','skip');
INSERT INTO "votes" VALUES('ubmXnk8N1fvfisOFCTm9P','-dHmMZU9vINwI8n4VJvBu','eUTS7VZUHxRztCDUt5rxe','interested');
INSERT INTO "votes" VALUES('F_-FSxkuGt6NbEXn4x8g2','PUyTEB86fdKssANiw2Z5Z','eUTS7VZUHxRztCDUt5rxe','maybe');
INSERT INTO "votes" VALUES('y4I9CfwwXbMfoP6HFIHHd','gfn9WoF2ZeU7USBbQXEo3','eUTS7VZUHxRztCDUt5rxe','interested');
INSERT INTO "votes" VALUES('hJ9LX_2GimAaRxNYatKJ7','B3EY2YoqGYU3Y4ao-cSbq','eUTS7VZUHxRztCDUt5rxe','maybe');
INSERT INTO "votes" VALUES('f-CzJKGUo9fjyG1eQwQvy','yK6ktOWVUW7DLCbTVofXO','eUTS7VZUHxRztCDUt5rxe','maybe');
INSERT INTO "votes" VALUES('jQkPkA1cwtvB-KlKkLLco','qtz5Z7fj1rd3vSlfVl_Oj','eUTS7VZUHxRztCDUt5rxe','maybe');
INSERT INTO "votes" VALUES('A6y9ZSAkmR1oPQ_5S5eLC','fDfkj_A3YHQgf0wA11HnH','ErnEvyixQnkAvuVAh4bv6','interested');
INSERT INTO "votes" VALUES('l-_xAl4fPAWrEhAFtakVZ','T8eqMqOwRkIbvARD6buMu','ErnEvyixQnkAvuVAh4bv6','interested');
INSERT INTO "votes" VALUES('2zhLEBQTRt84QaBm9lU3n','Kd31uzYlG2SJXTCxU4B6n','ErnEvyixQnkAvuVAh4bv6','skip');
INSERT INTO "votes" VALUES('axj5zx2gwohnS0Jz8q7qs','PUyTEB86fdKssANiw2Z5Z','ErnEvyixQnkAvuVAh4bv6','skip');
INSERT INTO "votes" VALUES('QqClsBM6c6B8kstpQ_lTO','XGcZR0RBZshontgBN8zFz','ErnEvyixQnkAvuVAh4bv6','maybe');
INSERT INTO "votes" VALUES('u82lOTIWNRdoY9qtZSmCi','drp02tnCSlduoXCGpBQh6','ErnEvyixQnkAvuVAh4bv6','skip');
INSERT INTO "votes" VALUES('bPr_jzxVjt3rTCMUYK3MS','WbgshTR3APoWRZQz2H1j5','ErnEvyixQnkAvuVAh4bv6','interested');
INSERT INTO "votes" VALUES('ZZGXS17P9zg7Mff1AwQMo','-dHmMZU9vINwI8n4VJvBu','CiX9cRrwJiGHFqt1To2vX','maybe');
INSERT INTO "votes" VALUES('KQGvjxiKmivWujFLWCTo1','Kd31uzYlG2SJXTCxU4B6n','CiX9cRrwJiGHFqt1To2vX','skip');
INSERT INTO "votes" VALUES('lJjjUIHjrdWk4truAsnK5','PUyTEB86fdKssANiw2Z5Z','CiX9cRrwJiGHFqt1To2vX','skip');
INSERT INTO "votes" VALUES('p_X8THaYRQW5CA7rTHOV-','XGcZR0RBZshontgBN8zFz','CiX9cRrwJiGHFqt1To2vX','maybe');
INSERT INTO "votes" VALUES('68j4oZzevhpzMF-ovW16t','PqPhLTi8GZt6zd0LfzT7M','CiX9cRrwJiGHFqt1To2vX','maybe');
INSERT INTO "votes" VALUES('ZecLNAUNZfZ-DClpO06H6','xLfbrVvLQHttdUs4Jsqfu','CiX9cRrwJiGHFqt1To2vX','interested');
INSERT INTO "votes" VALUES('UpBZCNz26VSPkffzN2V2C','WbgshTR3APoWRZQz2H1j5','CiX9cRrwJiGHFqt1To2vX','interested');
INSERT INTO "votes" VALUES('9vi91ZvQ-bzdPHy55RQH6','gNM6bQ9rCnfXEgpCq2vZE','HBaMqp-NtQJctBdn2oCbS','maybe');
INSERT INTO "votes" VALUES('WBb0d9tWTJSrr0S5_bc_w','zZJCYCZNXvcyaq66wpufI','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('GiOVHrX0Ug064z4Yxhr5p','Kd31uzYlG2SJXTCxU4B6n','HBaMqp-NtQJctBdn2oCbS','maybe');
INSERT INTO "votes" VALUES('G6sdRJzxyJpPkiT5SQAGY','XGcZR0RBZshontgBN8zFz','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('tAWBX48W_NJmP3n9FVjrS','drp02tnCSlduoXCGpBQh6','HBaMqp-NtQJctBdn2oCbS','maybe');
INSERT INTO "votes" VALUES('w0MYs7ZycGUl7_r8pCijF','ryCpFeoiOPkOxJzCY2U_V','HBaMqp-NtQJctBdn2oCbS','interested');
INSERT INTO "votes" VALUES('iMIAUIXOCOHmPHXCIeXvW','gNM6bQ9rCnfXEgpCq2vZE','MuwFQb2m-Ux3Zpq27RA5J','maybe');
INSERT INTO "votes" VALUES('iEpQ1tWygFS_ySRNtPoiK','T8eqMqOwRkIbvARD6buMu','MuwFQb2m-Ux3Zpq27RA5J','interested');
INSERT INTO "votes" VALUES('c0uDgaRbBu4HszrjmnASd','zZJCYCZNXvcyaq66wpufI','MuwFQb2m-Ux3Zpq27RA5J','skip');
INSERT INTO "votes" VALUES('unhTqBo1DAcS3SPyitcQ9','Kd31uzYlG2SJXTCxU4B6n','MuwFQb2m-Ux3Zpq27RA5J','maybe');
INSERT INTO "votes" VALUES('PUjBEXx6O6-RJjuj86gwy','PUyTEB86fdKssANiw2Z5Z','MuwFQb2m-Ux3Zpq27RA5J','skip');
INSERT INTO "votes" VALUES('2eRPA17Lbt1Jzmd2TmqS6','PqPhLTi8GZt6zd0LfzT7M','MuwFQb2m-Ux3Zpq27RA5J','interested');
INSERT INTO "votes" VALUES('kBCSzHhXNqgMiXql-Orb6','drp02tnCSlduoXCGpBQh6','MuwFQb2m-Ux3Zpq27RA5J','interested');
INSERT INTO "votes" VALUES('kCbd86WmTaYwXcn9ICVRK','gfn9WoF2ZeU7USBbQXEo3','MuwFQb2m-Ux3Zpq27RA5J','interested');
INSERT INTO "votes" VALUES('pGPEZsIesnCPMOhWR8osE','ryCpFeoiOPkOxJzCY2U_V','MuwFQb2m-Ux3Zpq27RA5J','skip');
INSERT INTO "votes" VALUES('Ki9Q-t9dMp4EQrML4bgCk','eyc0neG2_gmhkOyLWgxGC','MuwFQb2m-Ux3Zpq27RA5J','maybe');
INSERT INTO "votes" VALUES('LjX6fwA7nUTOtD-mCLe0o','fDfkj_A3YHQgf0wA11HnH','NjfILIKw5lpMwE8wIm9rw','skip');
INSERT INTO "votes" VALUES('C4rORDh-QbuXyuh_jetFf','zZJCYCZNXvcyaq66wpufI','NjfILIKw5lpMwE8wIm9rw','skip');
INSERT INTO "votes" VALUES('xa0R8dyrOEE4KSCBzjIYG','Kd31uzYlG2SJXTCxU4B6n','NjfILIKw5lpMwE8wIm9rw','maybe');
INSERT INTO "votes" VALUES('dw2k6Y2rveSaQxocrJdZb','0suS1VYA4ThBo69EmSnTO','NjfILIKw5lpMwE8wIm9rw','maybe');
INSERT INTO "votes" VALUES('cVNMBOYd08Zrj3Qs_VV5a','drp02tnCSlduoXCGpBQh6','NjfILIKw5lpMwE8wIm9rw','interested');
INSERT INTO "votes" VALUES('Qo7saWGeK9GvP7XpMWikk','WbgshTR3APoWRZQz2H1j5','NjfILIKw5lpMwE8wIm9rw','skip');
INSERT INTO "votes" VALUES('xRz69JJ8p8GzdBj9U7eQw','eyc0neG2_gmhkOyLWgxGC','NjfILIKw5lpMwE8wIm9rw','skip');
INSERT INTO "votes" VALUES('mEV18C7aDtAzLj5-9snRg','-dHmMZU9vINwI8n4VJvBu','tMTYBscBvrY3UzeU96E8X','interested');
INSERT INTO "votes" VALUES('wJ9mXfbNGG_Zj4ykKN85B','gNM6bQ9rCnfXEgpCq2vZE','tMTYBscBvrY3UzeU96E8X','maybe');
INSERT INTO "votes" VALUES('cSlcK0VgxVwOMjmFu-V-9','eyc0neG2_gmhkOyLWgxGC','tMTYBscBvrY3UzeU96E8X','maybe');
INSERT INTO "votes" VALUES('_u0nC3L0YiMGlgDStL6I4','-dHmMZU9vINwI8n4VJvBu','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('d-mhnJR-IjebK9c3F0iOg','T8eqMqOwRkIbvARD6buMu','spQSZeX7xXbnA8PdFDn4t','interested');
INSERT INTO "votes" VALUES('ZJp5pYeKyfzYtW78l2d3e','zZJCYCZNXvcyaq66wpufI','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('yj4RPEmEvtoEfiKOEZz2i','Kd31uzYlG2SJXTCxU4B6n','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('EDPwkZyLiI9SOaC25rO92','PUyTEB86fdKssANiw2Z5Z','spQSZeX7xXbnA8PdFDn4t','skip');
INSERT INTO "votes" VALUES('IgZSqxNpX0RQgaWkpWv8D','xLfbrVvLQHttdUs4Jsqfu','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('Im6NZdpAWwmnvZjbkJ7rZ','ryCpFeoiOPkOxJzCY2U_V','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('7bYJXQcdyTr_FeRTpGHy7','qtz5Z7fj1rd3vSlfVl_Oj','spQSZeX7xXbnA8PdFDn4t','skip');
INSERT INTO "votes" VALUES('Un6GT2rnMCKqeygsA4Jl6','WbgshTR3APoWRZQz2H1j5','spQSZeX7xXbnA8PdFDn4t','maybe');
INSERT INTO "votes" VALUES('VG9jirjgpOJia8p-CPNE8','gNM6bQ9rCnfXEgpCq2vZE','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('bbu3ypUCUvhSx1Xfmxyls','0suS1VYA4ThBo69EmSnTO','wlcahNVNIVSc54-_Yj_6K','maybe');
INSERT INTO "votes" VALUES('b2kf-NmRth7jnmXVg50Mf','PUyTEB86fdKssANiw2Z5Z','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('531KBMzzMUf7YNCs2eO2k','XGcZR0RBZshontgBN8zFz','wlcahNVNIVSc54-_Yj_6K','maybe');
INSERT INTO "votes" VALUES('rEC5xj_QskVDVBLhXf3Sp','PqPhLTi8GZt6zd0LfzT7M','wlcahNVNIVSc54-_Yj_6K','maybe');
INSERT INTO "votes" VALUES('iiYFLp9LkF_DwQg2K1H5u','B3EY2YoqGYU3Y4ao-cSbq','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('BSXoaODIiOCRrwinUO0q8','xLfbrVvLQHttdUs4Jsqfu','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('naA9Sv3iqUMxZlhshtsBL','ryCpFeoiOPkOxJzCY2U_V','wlcahNVNIVSc54-_Yj_6K','interested');
INSERT INTO "votes" VALUES('exxqGQczd6-U1hpY4MonW','eyc0neG2_gmhkOyLWgxGC','wlcahNVNIVSc54-_Yj_6K','skip');
INSERT INTO "votes" VALUES('Ie6MJ2Q8huXzrmZvAZ9wJ','fDfkj_A3YHQgf0wA11HnH','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('MLCH8PMw48D-QXDWX80N7','gNM6bQ9rCnfXEgpCq2vZE','-co1SIEViS_74Nne7F_tn','skip');
INSERT INTO "votes" VALUES('yLeL3jyHe2pSOVlsZg8Au','PqPhLTi8GZt6zd0LfzT7M','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('4rvzMiu6P02ckvQUoK6rw','B3EY2YoqGYU3Y4ao-cSbq','-co1SIEViS_74Nne7F_tn','maybe');
INSERT INTO "votes" VALUES('xl1x3CHfQy3ptN_YZ81Mr','WbgshTR3APoWRZQz2H1j5','-co1SIEViS_74Nne7F_tn','interested');
INSERT INTO "votes" VALUES('Z45LZ3jghkE4OhJTAHixV','fDfkj_A3YHQgf0wA11HnH','4gutz55F-QHGfFPFfdjwv','interested');
INSERT INTO "votes" VALUES('Y-x8esJt95k0WaFbYdyah','T8eqMqOwRkIbvARD6buMu','4gutz55F-QHGfFPFfdjwv','interested');
INSERT INTO "votes" VALUES('_L6TfJY9gWjiDh_6-BX4i','Kd31uzYlG2SJXTCxU4B6n','4gutz55F-QHGfFPFfdjwv','skip');
INSERT INTO "votes" VALUES('YgoOLzPqTJkoPB_6NTh_e','0suS1VYA4ThBo69EmSnTO','4gutz55F-QHGfFPFfdjwv','maybe');
INSERT INTO "votes" VALUES('DoqgJWsMsX2F3ehurQuwE','PUyTEB86fdKssANiw2Z5Z','4gutz55F-QHGfFPFfdjwv','maybe');
INSERT INTO "votes" VALUES('YsyUGBHwC1ttbMLzDCYZ-','gfn9WoF2ZeU7USBbQXEo3','4gutz55F-QHGfFPFfdjwv','interested');
INSERT INTO "votes" VALUES('rFCGS2STugxs6InOJNsBP','B3EY2YoqGYU3Y4ao-cSbq','4gutz55F-QHGfFPFfdjwv','interested');
INSERT INTO "votes" VALUES('qu_zp9vLhGRojA5Brj59V','-dHmMZU9vINwI8n4VJvBu','C0HmEuvkIpc1gF1giGvwa','maybe');
INSERT INTO "votes" VALUES('71TCZLyJXlu3i1nFDFejj','zZJCYCZNXvcyaq66wpufI','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('YEUIvhCpA-97sEEWx7i_B','Kd31uzYlG2SJXTCxU4B6n','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('OeWR4nuclwprlfuCYvw6Q','PUyTEB86fdKssANiw2Z5Z','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('Lq2sKYGbPuF320qfh_9ou','XGcZR0RBZshontgBN8zFz','C0HmEuvkIpc1gF1giGvwa','maybe');
INSERT INTO "votes" VALUES('So23aXyA0f9_oCxy2hIZs','PqPhLTi8GZt6zd0LfzT7M','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('uA7Hsdbrr5nKCXzqEWhxL','drp02tnCSlduoXCGpBQh6','C0HmEuvkIpc1gF1giGvwa','skip');
INSERT INTO "votes" VALUES('LxOzoBiUdtuWqxK5OiCnj','yK6ktOWVUW7DLCbTVofXO','C0HmEuvkIpc1gF1giGvwa','maybe');
INSERT INTO "votes" VALUES('d7UvhT2KBQFAEGyNifztP','ryCpFeoiOPkOxJzCY2U_V','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('nNyk3tgUqCjfWC_WOGXB-','eyc0neG2_gmhkOyLWgxGC','C0HmEuvkIpc1gF1giGvwa','interested');
INSERT INTO "votes" VALUES('tsw7Lk4h0ZJfYki5jawkO','PqPhLTi8GZt6zd0LfzT7M','QP-lEjBteOzXVC_SwiB38','skip');
INSERT INTO "votes" VALUES('ByX42lc7WA4TWZYyu_to0','drp02tnCSlduoXCGpBQh6','QP-lEjBteOzXVC_SwiB38','interested');
INSERT INTO "votes" VALUES('BebGKoebNMlyXYuBbtUSA','gfn9WoF2ZeU7USBbQXEo3','QP-lEjBteOzXVC_SwiB38','skip');
INSERT INTO "votes" VALUES('h-qecE7wjS4FnD6qGOwlq','yK6ktOWVUW7DLCbTVofXO','QP-lEjBteOzXVC_SwiB38','maybe');
INSERT INTO "votes" VALUES('hxvn1IsTCsIi2ee9YieJK','xLfbrVvLQHttdUs4Jsqfu','QP-lEjBteOzXVC_SwiB38','maybe');
INSERT INTO "votes" VALUES('KLGSwolWhkASRU1_USatp','qtz5Z7fj1rd3vSlfVl_Oj','QP-lEjBteOzXVC_SwiB38','skip');
INSERT INTO "votes" VALUES('i1dbQaXmnofyjnaKVxqXI','eyc0neG2_gmhkOyLWgxGC','QP-lEjBteOzXVC_SwiB38','maybe');
INSERT INTO "votes" VALUES('9swymgEIpk9Ha2__WstdW','gNM6bQ9rCnfXEgpCq2vZE','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('bRcFp1s2fF2A3x5kyau9h','T8eqMqOwRkIbvARD6buMu','zqrsPDdZpo61XLeStMzTP','interested');
INSERT INTO "votes" VALUES('gBvEXDPTVP0vFR2fKyzTs','zZJCYCZNXvcyaq66wpufI','zqrsPDdZpo61XLeStMzTP','interested');
INSERT INTO "votes" VALUES('dk9MaPGxCDtxJUD7IpoGS','0suS1VYA4ThBo69EmSnTO','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('X3dNejeHdH1lTlpi6-uWG','PUyTEB86fdKssANiw2Z5Z','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('8UlCWG_Pdqj7FWke3QkEw','PqPhLTi8GZt6zd0LfzT7M','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('ulut9LGBtHSicyjvp59Pk','gfn9WoF2ZeU7USBbQXEo3','zqrsPDdZpo61XLeStMzTP','interested');
INSERT INTO "votes" VALUES('YYjijSnAAqUNeRD2PqT94','WbgshTR3APoWRZQz2H1j5','zqrsPDdZpo61XLeStMzTP','maybe');
INSERT INTO "votes" VALUES('HqiH4XkaFQLwlbFGvJr1W','fDfkj_A3YHQgf0wA11HnH','8Y4m2fOhOxAi1OQk9dv7m','maybe');
INSERT INTO "votes" VALUES('8uUE6io06QUrzJGLAAHOH','-dHmMZU9vINwI8n4VJvBu','8Y4m2fOhOxAi1OQk9dv7m','maybe');
INSERT INTO "votes" VALUES('19tkRk4VXeeY3PQ1-L4tS','PUyTEB86fdKssANiw2Z5Z','8Y4m2fOhOxAi1OQk9dv7m','interested');
INSERT INTO "votes" VALUES('ATEuPQVGu73zbwC1Mlx5C','drp02tnCSlduoXCGpBQh6','8Y4m2fOhOxAi1OQk9dv7m','maybe');
INSERT INTO "votes" VALUES('dX8NUa8NHD0Y5NLG4KQ3v','gfn9WoF2ZeU7USBbQXEo3','8Y4m2fOhOxAi1OQk9dv7m','maybe');
INSERT INTO "votes" VALUES('u50u7qq0A5MFcVk4S3Cfw','qtz5Z7fj1rd3vSlfVl_Oj','8Y4m2fOhOxAi1OQk9dv7m','interested');
INSERT INTO "votes" VALUES('1ZITpniIyo8qx6aXvAv5_','eyc0neG2_gmhkOyLWgxGC','8Y4m2fOhOxAi1OQk9dv7m','interested');
INSERT INTO "votes" VALUES('DphJGzJaXWvGiEMZ4q1TC','T8eqMqOwRkIbvARD6buMu','ZEWIRXSjbqW_a6Cpdax7W','skip');
INSERT INTO "votes" VALUES('r5GjBUKdF4eB3wvm8Z0hB','Kd31uzYlG2SJXTCxU4B6n','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('o8NYA8RWATuQoCb4_-31x','XGcZR0RBZshontgBN8zFz','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('8DojKLdIp8IIdPqmxGA2M','drp02tnCSlduoXCGpBQh6','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('9W19h74TQrhCnlXwfGtnY','yK6ktOWVUW7DLCbTVofXO','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('aZ6SPTbk72f6b7NSot011','ryCpFeoiOPkOxJzCY2U_V','ZEWIRXSjbqW_a6Cpdax7W','skip');
INSERT INTO "votes" VALUES('7DThQLrxc2nNNtRS7WsPc','qtz5Z7fj1rd3vSlfVl_Oj','ZEWIRXSjbqW_a6Cpdax7W','skip');
INSERT INTO "votes" VALUES('Lv9PN8IoGMxPHXUplvI8m','WbgshTR3APoWRZQz2H1j5','ZEWIRXSjbqW_a6Cpdax7W','interested');
INSERT INTO "votes" VALUES('xCyTVDrFYiuH8Iefs3JXc','eyc0neG2_gmhkOyLWgxGC','ZEWIRXSjbqW_a6Cpdax7W','maybe');
INSERT INTO "votes" VALUES('sjbWTxD6ui1EPR-FYKbvz','fDfkj_A3YHQgf0wA11HnH','XDWlCENodtX7WgvxQZt83','skip');
INSERT INTO "votes" VALUES('nMddfY1hajUBsaUFPhlR6','T8eqMqOwRkIbvARD6buMu','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('q-3o0jDk_UGRKcWRalI7g','0suS1VYA4ThBo69EmSnTO','XDWlCENodtX7WgvxQZt83','skip');
INSERT INTO "votes" VALUES('aitdKFzJA7ZNM3colIk6w','XGcZR0RBZshontgBN8zFz','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('FdxNuvxjDFQLxCmZXgsdk','drp02tnCSlduoXCGpBQh6','XDWlCENodtX7WgvxQZt83','maybe');
INSERT INTO "votes" VALUES('grzYKaC1RTqIxXTrxhnq8','B3EY2YoqGYU3Y4ao-cSbq','XDWlCENodtX7WgvxQZt83','maybe');
INSERT INTO "votes" VALUES('39dEXI4wrzUpct3wC9f1O','xLfbrVvLQHttdUs4Jsqfu','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('nXSEr9Y-6WXMnCtweurVh','WbgshTR3APoWRZQz2H1j5','XDWlCENodtX7WgvxQZt83','interested');
INSERT INTO "votes" VALUES('7Tfq2OKX7qGgY1qjx_X2V','fDfkj_A3YHQgf0wA11HnH','n1q2bwTgEUk3zrC9wnF4-','skip');
INSERT INTO "votes" VALUES('u1pkg7G184bOvB94zBuDR','gNM6bQ9rCnfXEgpCq2vZE','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('cALFN4lyj0K8Sfi_q02vN','PqPhLTi8GZt6zd0LfzT7M','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('u9-xJHqrHARR6MdDPI819','gfn9WoF2ZeU7USBbQXEo3','n1q2bwTgEUk3zrC9wnF4-','skip');
INSERT INTO "votes" VALUES('_hwZTVnLXNN7-DQh-1FtJ','yK6ktOWVUW7DLCbTVofXO','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('UwAWDJf0u5Z8lRcgn3627','xLfbrVvLQHttdUs4Jsqfu','n1q2bwTgEUk3zrC9wnF4-','skip');
INSERT INTO "votes" VALUES('MuiUNAIPvCJj2nlC_kLjg','WbgshTR3APoWRZQz2H1j5','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('lOfL6o4PbPMPZL2g8dlUr','eyc0neG2_gmhkOyLWgxGC','n1q2bwTgEUk3zrC9wnF4-','interested');
INSERT INTO "votes" VALUES('_0ob2qP1exjydMtZWcWOc','-dHmMZU9vINwI8n4VJvBu','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('TwqHEdfY-FXRoMHDSyfJ5','gNM6bQ9rCnfXEgpCq2vZE','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('-8a-AOh1jKvtdPx9NP67g','T8eqMqOwRkIbvARD6buMu','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('6MmrckMd9jqcP3mC-4f5Q','Kd31uzYlG2SJXTCxU4B6n','sJ9x5dTy1G3354WUz-PBl','skip');
INSERT INTO "votes" VALUES('JhJgJBN6AZc1fab2bYcpM','XGcZR0RBZshontgBN8zFz','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('4Cj0tDK6du2oKNYIMKAcf','PqPhLTi8GZt6zd0LfzT7M','sJ9x5dTy1G3354WUz-PBl','maybe');
INSERT INTO "votes" VALUES('209Vi2nDOXMd7Ot-vFkC2','drp02tnCSlduoXCGpBQh6','sJ9x5dTy1G3354WUz-PBl','interested');
INSERT INTO "votes" VALUES('KzhChUfK8glDpLuUITadq','eyc0neG2_gmhkOyLWgxGC','sJ9x5dTy1G3354WUz-PBl','skip');
CREATE TABLE "events" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`proposal_phase_start` text,
	`proposal_phase_end` text,
	`voting_phase_start` text,
	`voting_phase_end` text,
	`scheduling_phase_start` text,
	`scheduling_phase_end` text,
	`max_session_duration` integer DEFAULT 120 NOT NULL,
	`break_minutes` integer DEFAULT 10 NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`icon` text
, `slot_increment_minutes` integer DEFAULT 30 NOT NULL, `rsvp_capacity_hard_limit` integer DEFAULT false NOT NULL, `meetings_enabled` integer DEFAULT false NOT NULL, `max_open_meeting_requests` integer DEFAULT 5 NOT NULL);
INSERT INTO "events" VALUES('CEeA7A1EGNKg4ElF256p4','Conference Alpha','Conference-Alpha','Event currently in proposal phase','https://test-event-1.example.com','2026-09-27T09:58:27.556Z','2026-10-11T09:58:27.556Z','2026-10-11T09:58:27.556Z','2026-10-25T10:58:27.556Z','2026-10-25T10:58:27.556Z','2026-11-17T17:00:00.000Z',120,10,'Europe/Berlin','AcademicCapIcon',30,0,1,5);
INSERT INTO "events" VALUES('ahNcYyOhWe34CsrVdaPJ2','Conference Beta','Conference-Beta','Event currently in **voting** phase — cast your votes and check the [event website](https://test-event-2.example.com) for updates.','https://test-event-2.example.com','2026-09-13T09:58:27.556Z','2026-09-27T09:58:27.556Z','2026-09-27T09:58:27.556Z','2026-10-11T09:58:27.556Z','2026-10-11T09:58:27.556Z','2026-11-03T17:00:00.000Z',120,10,'Europe/Berlin','BeakerIcon',30,0,1,5);
INSERT INTO "events" VALUES('fHvlvt0u4u_ipYdqvYykd','Conference Gamma','Conference-Gamma','Event currently in **scheduling phase**.

### Quick links

- [Venue map](https://test-event-3.example.com/map)
- [Code of conduct](https://test-event-3.example.com/coc)','https://test-event-3.example.com','2026-08-30T09:58:27.556Z','2026-09-13T09:58:27.556Z','2026-09-13T09:58:27.556Z','2026-09-27T09:58:27.556Z','2026-09-27T09:58:27.556Z','2026-10-21T01:00:00.000Z',120,10,'Europe/Berlin','GlobeAltIcon',30,0,1,5);
CREATE TABLE "sessions" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`start_time` text,
	`end_time` text,
	`capacity` integer DEFAULT 0 NOT NULL,
	`admin_managed` integer DEFAULT true NOT NULL,
	`blocker` integer DEFAULT false NOT NULL,
	`closed` integer DEFAULT false NOT NULL,
	`proposal_id` text,
	`event_id` text NOT NULL, `attendee_count` integer,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "sessions" VALUES('_Q0f0ey7vKwNhRm1oei_W','Opening Keynote - Conference Alpha','Welcome to Conference Alpha','2026-11-15T08:00:00.000Z','2026-11-15T09:30:00.000Z',100,1,0,0,NULL,'CEeA7A1EGNKg4ElF256p4',NULL);
INSERT INTO "sessions" VALUES('NV2C6M6fxu86gO4vdQNF7','Lunch Break','','2026-11-15T11:30:00.000Z','2026-11-15T13:00:00.000Z',0,1,1,0,NULL,'CEeA7A1EGNKg4ElF256p4',NULL);
INSERT INTO "sessions" VALUES('0Q3LBP--5rZKfa6aVnU8F','Lunch Break','','2026-11-16T11:30:00.000Z','2026-11-16T13:00:00.000Z',0,1,1,0,NULL,'CEeA7A1EGNKg4ElF256p4',NULL);
INSERT INTO "sessions" VALUES('-l4piIZIC5KF3tuWqgr-8','Lunch Break','','2026-11-17T11:30:00.000Z','2026-11-17T13:00:00.000Z',0,1,1,0,NULL,'CEeA7A1EGNKg4ElF256p4',NULL);
INSERT INTO "sessions" VALUES('slKwXUv402_mndQh7qY6G','Opening Keynote - Conference Beta','Welcome to Conference Beta','2026-11-01T08:00:00.000Z','2026-11-01T09:30:00.000Z',100,1,0,0,NULL,'ahNcYyOhWe34CsrVdaPJ2',NULL);
INSERT INTO "sessions" VALUES('Cp58DxobUr7vV8XrNy-Bn','Lunch Break','','2026-11-01T11:30:00.000Z','2026-11-01T13:00:00.000Z',0,1,1,0,NULL,'ahNcYyOhWe34CsrVdaPJ2',NULL);
INSERT INTO "sessions" VALUES('CbD_lQxFTImHbluBtRJTe','Lunch Break','','2026-11-02T11:30:00.000Z','2026-11-02T13:00:00.000Z',0,1,1,0,NULL,'ahNcYyOhWe34CsrVdaPJ2',NULL);
INSERT INTO "sessions" VALUES('ekfRe6CEuGfmIEQhqk47I','Lunch Break','','2026-11-03T11:30:00.000Z','2026-11-03T13:00:00.000Z',0,1,1,0,NULL,'ahNcYyOhWe34CsrVdaPJ2',NULL);
INSERT INTO "sessions" VALUES('EjXm8uh6qTecmr1FfiX0A','Opening Keynote - Conference Gamma','Welcome to Conference Gamma','2026-10-18T07:00:00.000Z','2026-10-18T08:30:00.000Z',100,1,0,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('YrfcitKBSWdAWw7XkbW5N','Lunch Break','','2026-10-18T10:30:00.000Z','2026-10-18T12:00:00.000Z',0,1,1,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('3hlgbjOZG_6lNN9WzIhF0','Lunch Break','','2026-10-19T10:30:00.000Z','2026-10-19T12:00:00.000Z',0,1,1,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('VDuZHvThJc_X4NbTmU5vg','Lunch Break','','2026-10-20T10:30:00.000Z','2026-10-20T12:00:00.000Z',0,1,1,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('W40VrZg5VhgM-p7tfCGis','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT','2026-10-18T09:10:00.000Z','2026-10-18T10:00:00.000Z',100,0,0,0,'-dHmMZU9vINwI8n4VJvBu','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('cl0XFrbAvEpXPd3R7HMOd','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort','2026-10-18T09:10:00.000Z','2026-10-18T10:30:00.000Z',30,0,0,1,'gNM6bQ9rCnfXEgpCq2vZE','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('OaIVrOTsjyle0dW2xFa-R','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.','2026-10-18T12:10:00.000Z','2026-10-18T13:00:00.000Z',100,0,0,0,'T8eqMqOwRkIbvARD6buMu','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('AIKSgQ1zFCVvzU216S87n','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.','2026-10-18T12:10:00.000Z','2026-10-18T13:30:00.000Z',25,0,0,0,'B3EY2YoqGYU3Y4ao-cSbq','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('ZBmYh374V--830nt0XeiO','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.','2026-10-18T13:40:00.000Z','2026-10-18T14:30:00.000Z',30,0,0,0,'XGcZR0RBZshontgBN8zFz','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('coDqGOSo1L6mdIN4QZdFq','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.','2026-10-19T07:10:00.000Z','2026-10-19T08:00:00.000Z',100,0,0,0,'fDfkj_A3YHQgf0wA11HnH','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('w22sXfqYp_4K-jzZSK2C5','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.','2026-10-19T08:10:00.000Z','2026-10-19T09:30:00.000Z',25,0,0,0,'PqPhLTi8GZt6zd0LfzT7M','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('q0nBxEMD9qmO2NiBK2Qmq','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.','2026-10-19T08:40:00.000Z','2026-10-19T10:00:00.000Z',30,0,0,0,'gfn9WoF2ZeU7USBbQXEo3','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('dHJVXduZbvyIn2x0gUolV','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.','2026-10-19T12:10:00.000Z','2026-10-19T13:00:00.000Z',100,0,0,0,'xLfbrVvLQHttdUs4Jsqfu','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('JSFbkDLV2SXffkLMUqsoI','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.','2026-10-19T12:10:00.000Z','2026-10-19T13:00:00.000Z',25,0,0,0,'0suS1VYA4ThBo69EmSnTO','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('wbo61NcnAIXZUf_bbx3f-','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.','2026-10-19T14:10:00.000Z','2026-10-19T15:00:00.000Z',100,0,0,0,'PUyTEB86fdKssANiw2Z5Z','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('xaKVSGCLL3BsGUopeo4vS','Hallway Track: CRDT Show & Tell','Impromptu session: I''ll demo a small real-time collaborative editor built on [CRDTs](https://crdt.tech) and we can poke at the edge cases together. Bring your laptop if you want to pair on it.

Added straight to the schedule because the hallway conversation got out of hand — *that''s what open scheduling is for!*','2026-10-19T14:10:00.000Z','2026-10-19T14:30:00.000Z',15,0,0,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('MSvAPIFXDq01HHS9JDgtN','Evening Wrap-up','Loose ends and goodbyes before dinner.','2026-10-19T15:40:00.000Z','2026-10-19T16:00:00.000Z',100,0,0,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('sDcTHgpVk4j_lO2cO2UTT','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.','2026-10-20T07:10:00.000Z','2026-10-20T08:00:00.000Z',100,0,0,0,'Kd31uzYlG2SJXTCxU4B6n','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('LI3QOfdBHbjIr6v3k0nZr','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.','2026-10-20T08:10:00.000Z','2026-10-20T09:00:00.000Z',30,0,0,0,'drp02tnCSlduoXCGpBQh6','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('DgxPPdJMWm_VLUl5HImfU','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.','2026-10-20T08:40:00.000Z','2026-10-20T09:30:00.000Z',25,0,0,0,'yK6ktOWVUW7DLCbTVofXO','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('gX6i_M_dOtR5nk2-ggsZY','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.','2026-10-20T12:10:00.000Z','2026-10-20T13:00:00.000Z',100,0,0,0,'zZJCYCZNXvcyaq66wpufI','fHvlvt0u4u_ipYdqvYykd',NULL);
INSERT INTO "sessions" VALUES('tWKW2d-M87Rm5yJAOVfHw','Closing Session & Farewell','Wrap-up of Conference Gamma:

- Community announcements
- A look back at the highlights of the last three days
- Thank-yous to volunteers and speakers
- A preview of next year''s edition

We close with a group photo in front of the **Main Hall**.','2026-10-20T14:10:00.000Z','2026-10-20T15:00:00.000Z',100,1,0,0,NULL,'fHvlvt0u4u_ipYdqvYykd',NULL);
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Example Conference Weekend' NOT NULL,
	`description` text DEFAULT 'Welcome! Browse the schedules for each event below.' NOT NULL,
	`map_image_url` text DEFAULT '' NOT NULL
);
CREATE TABLE `auth_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`salt` text NOT NULL,
	`code_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL, `purpose` text DEFAULT 'login' NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text,
	`parent_id` text,
	`body` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`created_time` text NOT NULL,
	`edited_time` text,
	FOREIGN KEY (`author_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "comments" VALUES('Os4VQKDc5zb4CNNRQTqIW',NULL,NULL,'',1,'2026-10-03T23:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('fmMbl5oKu_OPy9YAoQUGD','KH3xfoA5aQ0nM18lsn-eI','Os4VQKDc5zb4CNNRQTqIW','Good question — no background needed, I''ll start from scratch.',0,'2026-10-04T00:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('6kRDmC9kHx1cLl8kJyB4o','IswnQbyqCn7NbXRsGsD2W','fmMbl5oKu_OPy9YAoQUGD','Perfect, count me in.',0,'2026-10-04T01:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('IGDaGvkCEGuldvyD2kjrl','WBHNKMCNBmxx_MlTbJDAD',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-10-04T02:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('G7znTtk_SjrcsUutIrTgP','WBHNKMCNBmxx_MlTbJDAD',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-10-04T00:12:28.107Z',NULL);
INSERT INTO "comments" VALUES('n7TdTDx-zGTsec9H456Hv','5i9i_3GcjIBT09rfaKCJZ',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-10-04T03:12:28.107Z',NULL);
INSERT INTO "comments" VALUES('O68DGM5VhGMZLq6xdHPjs','7ZOGrOLuXLRiOuIcv9flt',NULL,'Could this be scheduled later in the day? It clashes with the workshop block.',0,'2026-10-04T00:26:28.107Z',NULL);
INSERT INTO "comments" VALUES('QmznXv4hraRwRuLuqU4z-','Csy_BmrogZyATJ0Rc-yVO','O68DGM5VhGMZLq6xdHPjs','Good question — no background needed, I''ll start from scratch.',0,'2026-10-04T01:26:28.107Z',NULL);
INSERT INTO "comments" VALUES('Ap9KjS-dWdPUryJgoKL7Z','7ZOGrOLuXLRiOuIcv9flt',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-10-04T00:40:28.107Z',NULL);
INSERT INTO "comments" VALUES('4N3bRPVm52GqUJBT_S9iZ','KH3xfoA5aQ0nM18lsn-eI',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-10-03T23:58:28.107Z','2026-10-04T00:02:28.107Z');
INSERT INTO "comments" VALUES('iV99L2jBzKjAaU-OJps-G','lRV_MMuPjX6NqTuMfEa2W','4N3bRPVm52GqUJBT_S9iZ','Good question — no background needed, I''ll start from scratch.',0,'2026-10-04T00:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('DkpI94SYybpXkn7EDGyab','IswnQbyqCn7NbXRsGsD2W','iV99L2jBzKjAaU-OJps-G','Perfect, count me in.',0,'2026-10-04T01:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('wiKwTsditzlasSUaDU0P1','WBHNKMCNBmxx_MlTbJDAD',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-10-04T02:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('QRe8D_LbnB46OMUpWakVb','IswnQbyqCn7NbXRsGsD2W',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-10-04T00:12:28.107Z',NULL);
INSERT INTO "comments" VALUES('KpcjnJguyTnmQJUcre187','ApV8IbWBVTVCMdBfaJ48D',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-10-04T00:47:28.107Z',NULL);
INSERT INTO "comments" VALUES('BD8toBfKEcp76rGZOwa-7','mansprtxW1DJ8XKr1ZxbH','KpcjnJguyTnmQJUcre187','Later works for me. I''ll flag it when scheduling opens.',0,'2026-10-04T01:47:28.107Z',NULL);
INSERT INTO "comments" VALUES('0MaLUDB5iU-ddGGtjS8z3','W6jSzvl_D_aDAYrsRkkxU','BD8toBfKEcp76rGZOwa-7','That makes sense, thanks for explaining!',0,'2026-10-04T02:47:28.107Z',NULL);
INSERT INTO "comments" VALUES('shSsO2VJ8P3Kjs8z3-skU','lRV_MMuPjX6NqTuMfEa2W',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-10-04T00:05:28.107Z',NULL);
INSERT INTO "comments" VALUES('-x9fIKy-bu7fZT1gvEBW9','WBHNKMCNBmxx_MlTbJDAD','shSsO2VJ8P3Kjs8z3-skU','Yes please, drop me a message and we''ll plan it together.',0,'2026-10-04T01:05:28.107Z',NULL);
INSERT INTO "comments" VALUES('yy3IIxrLFFXEjT-qiBl16','5i9i_3GcjIBT09rfaKCJZ',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-10-04T00:33:28.107Z','2026-10-04T00:37:28.107Z');
INSERT INTO "comments" VALUES('37fQu862XgX57tVCwyGl5','jkh2TC9UTQ5jXzqfwLizh','yy3IIxrLFFXEjT-qiBl16','Yes please, drop me a message and we''ll plan it together.',0,'2026-10-04T01:33:28.107Z',NULL);
INSERT INTO "comments" VALUES('oWPbvWQJEDk09euwqs3pO','7ZOGrOLuXLRiOuIcv9flt','37fQu862XgX57tVCwyGl5','That makes sense, thanks for explaining!',0,'2026-10-04T02:33:28.107Z',NULL);
INSERT INTO "comments" VALUES('s4AnSRUrGN-X8qyH6FgSg','7ZOGrOLuXLRiOuIcv9flt',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-10-04T00:40:28.107Z',NULL);
INSERT INTO "comments" VALUES('uaOHWFF2Xfxjwxai04pr9','ErnEvyixQnkAvuVAh4bv6','s4AnSRUrGN-X8qyH6FgSg','I''d rather keep them separate, they go in quite different directions.',0,'2026-10-04T01:40:28.107Z',NULL);
INSERT INTO "comments" VALUES('wuiiuii-RdFxuzFAkLhsI','ApV8IbWBVTVCMdBfaJ48D','uaOHWFF2Xfxjwxai04pr9','Perfect, count me in.',0,'2026-10-04T02:40:28.107Z',NULL);
INSERT INTO "comments" VALUES('iGMcbxeewvLy-QtU2KB2F','mansprtxW1DJ8XKr1ZxbH',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-10-04T03:40:28.107Z',NULL);
INSERT INTO "comments" VALUES('urX4reFvFyrCjJ3ekrXI1','mansprtxW1DJ8XKr1ZxbH',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-10-04T00:54:28.107Z',NULL);
INSERT INTO "comments" VALUES('LzLtLQ061fST8JqdSWSeo','t5DgVPLDS0n9Zfp1mwtgU',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-10-04T01:08:28.107Z','2026-10-04T01:12:28.107Z');
INSERT INTO "comments" VALUES('Z0h8aa2_2JOtFI_0tkGHP','t5DgVPLDS0n9Zfp1mwtgU',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-10-04T01:15:28.107Z',NULL);
INSERT INTO "comments" VALUES('MoafxqTX9ao8LC7BUOsM2','YX2l5gVowbAVoY-CXUskE',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-10-04T01:22:28.107Z',NULL);
INSERT INTO "comments" VALUES('uwwnEXSn6B6AAZgfWJXT5','8Y4m2fOhOxAi1OQk9dv7m','MoafxqTX9ao8LC7BUOsM2','Good question — no background needed, I''ll start from scratch.',0,'2026-10-04T02:22:28.107Z',NULL);
INSERT INTO "comments" VALUES('cvplFV1Atb71eCSNbMq0D','m69ckm5IrsgDvpRPsTKNV','uwwnEXSn6B6AAZgfWJXT5','Perfect, count me in.',0,'2026-10-04T03:22:28.107Z',NULL);
INSERT INTO "comments" VALUES('hbpQkJ4JG0imH1iFm58ZA','felLPYPQshS_hYQoeLaT_',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-10-04T01:43:28.107Z','2026-10-04T01:47:28.107Z');
INSERT INTO "comments" VALUES('hfObCeSkhTyNX4andCjxy','zqrsPDdZpo61XLeStMzTP','hbpQkJ4JG0imH1iFm58ZA','Later works for me. I''ll flag it when scheduling opens.',0,'2026-10-04T02:43:28.107Z',NULL);
INSERT INTO "comments" VALUES('J6NhW-HRRAI9ZuHuYX1CG','pJgBPKmbjinvqjurguDSG',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-10-04T04:43:28.107Z',NULL);
INSERT INTO "comments" VALUES('mQG83002QJV8a_E0oyMJT','pJgBPKmbjinvqjurguDSG',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-10-04T01:57:28.107Z',NULL);
INSERT INTO "comments" VALUES('cXYrkp35v_SirH0YW_hMo','I3NLsVdMJlvCaUmloWg_m',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-10-04T02:04:28.107Z',NULL);
INSERT INTO "comments" VALUES('xn6hclIzfMPnBDzG-d3ct','WBHNKMCNBmxx_MlTbJDAD',NULL,'Who else is on the panel?',0,'2026-10-04T04:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('giD3r5a_Gid5Lvu7ssu4P','Csy_BmrogZyATJ0Rc-yVO','xn6hclIzfMPnBDzG-d3ct','I''d like to join.',0,'2026-10-04T05:58:28.107Z',NULL);
INSERT INTO "comments" VALUES('r8xwDRWU5sAdH6UsNFl8U','5i9i_3GcjIBT09rfaKCJZ','xn6hclIzfMPnBDzG-d3ct','So would I.',0,'2026-10-04T06:58:28.107Z',NULL);
CREATE TABLE `proposal_comments` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_comments" VALUES('Os4VQKDc5zb4CNNRQTqIW','UYPJ3fkjt1UHAdKXREiBK');
INSERT INTO "proposal_comments" VALUES('fmMbl5oKu_OPy9YAoQUGD','UYPJ3fkjt1UHAdKXREiBK');
INSERT INTO "proposal_comments" VALUES('6kRDmC9kHx1cLl8kJyB4o','UYPJ3fkjt1UHAdKXREiBK');
INSERT INTO "proposal_comments" VALUES('IGDaGvkCEGuldvyD2kjrl','UYPJ3fkjt1UHAdKXREiBK');
INSERT INTO "proposal_comments" VALUES('G7znTtk_SjrcsUutIrTgP','ZI4tTb3VuZJcyAUmaSFAn');
INSERT INTO "proposal_comments" VALUES('n7TdTDx-zGTsec9H456Hv','ZI4tTb3VuZJcyAUmaSFAn');
INSERT INTO "proposal_comments" VALUES('O68DGM5VhGMZLq6xdHPjs','EMsxgebwVfOy3qd2njMme');
INSERT INTO "proposal_comments" VALUES('QmznXv4hraRwRuLuqU4z-','EMsxgebwVfOy3qd2njMme');
INSERT INTO "proposal_comments" VALUES('Ap9KjS-dWdPUryJgoKL7Z','nR2pYmS_qpHgKwPsp5fJ0');
INSERT INTO "proposal_comments" VALUES('4N3bRPVm52GqUJBT_S9iZ','XzLUY3ZT1PoqLsFSYrfQ9');
INSERT INTO "proposal_comments" VALUES('iV99L2jBzKjAaU-OJps-G','XzLUY3ZT1PoqLsFSYrfQ9');
INSERT INTO "proposal_comments" VALUES('DkpI94SYybpXkn7EDGyab','XzLUY3ZT1PoqLsFSYrfQ9');
INSERT INTO "proposal_comments" VALUES('wiKwTsditzlasSUaDU0P1','XzLUY3ZT1PoqLsFSYrfQ9');
INSERT INTO "proposal_comments" VALUES('QRe8D_LbnB46OMUpWakVb','_Lp-VtIaxkNp5ZM5ixanO');
INSERT INTO "proposal_comments" VALUES('KpcjnJguyTnmQJUcre187','Fe5EIjrgEU1t8Pwqt9ALs');
INSERT INTO "proposal_comments" VALUES('BD8toBfKEcp76rGZOwa-7','Fe5EIjrgEU1t8Pwqt9ALs');
INSERT INTO "proposal_comments" VALUES('0MaLUDB5iU-ddGGtjS8z3','Fe5EIjrgEU1t8Pwqt9ALs');
INSERT INTO "proposal_comments" VALUES('shSsO2VJ8P3Kjs8z3-skU','-dHmMZU9vINwI8n4VJvBu');
INSERT INTO "proposal_comments" VALUES('-x9fIKy-bu7fZT1gvEBW9','-dHmMZU9vINwI8n4VJvBu');
INSERT INTO "proposal_comments" VALUES('yy3IIxrLFFXEjT-qiBl16','Kd31uzYlG2SJXTCxU4B6n');
INSERT INTO "proposal_comments" VALUES('37fQu862XgX57tVCwyGl5','Kd31uzYlG2SJXTCxU4B6n');
INSERT INTO "proposal_comments" VALUES('oWPbvWQJEDk09euwqs3pO','Kd31uzYlG2SJXTCxU4B6n');
INSERT INTO "proposal_comments" VALUES('s4AnSRUrGN-X8qyH6FgSg','0suS1VYA4ThBo69EmSnTO');
INSERT INTO "proposal_comments" VALUES('uaOHWFF2Xfxjwxai04pr9','0suS1VYA4ThBo69EmSnTO');
INSERT INTO "proposal_comments" VALUES('wuiiuii-RdFxuzFAkLhsI','0suS1VYA4ThBo69EmSnTO');
INSERT INTO "proposal_comments" VALUES('iGMcbxeewvLy-QtU2KB2F','0suS1VYA4ThBo69EmSnTO');
INSERT INTO "proposal_comments" VALUES('urX4reFvFyrCjJ3ekrXI1','XGcZR0RBZshontgBN8zFz');
INSERT INTO "proposal_comments" VALUES('LzLtLQ061fST8JqdSWSeo','drp02tnCSlduoXCGpBQh6');
INSERT INTO "proposal_comments" VALUES('Z0h8aa2_2JOtFI_0tkGHP','gfn9WoF2ZeU7USBbQXEo3');
INSERT INTO "proposal_comments" VALUES('MoafxqTX9ao8LC7BUOsM2','B3EY2YoqGYU3Y4ao-cSbq');
INSERT INTO "proposal_comments" VALUES('uwwnEXSn6B6AAZgfWJXT5','B3EY2YoqGYU3Y4ao-cSbq');
INSERT INTO "proposal_comments" VALUES('cvplFV1Atb71eCSNbMq0D','B3EY2YoqGYU3Y4ao-cSbq');
INSERT INTO "proposal_comments" VALUES('hbpQkJ4JG0imH1iFm58ZA','ryCpFeoiOPkOxJzCY2U_V');
INSERT INTO "proposal_comments" VALUES('hfObCeSkhTyNX4andCjxy','ryCpFeoiOPkOxJzCY2U_V');
INSERT INTO "proposal_comments" VALUES('J6NhW-HRRAI9ZuHuYX1CG','ryCpFeoiOPkOxJzCY2U_V');
INSERT INTO "proposal_comments" VALUES('mQG83002QJV8a_E0oyMJT','WbgshTR3APoWRZQz2H1j5');
INSERT INTO "proposal_comments" VALUES('cXYrkp35v_SirH0YW_hMo','eyc0neG2_gmhkOyLWgxGC');
INSERT INTO "proposal_comments" VALUES('xn6hclIzfMPnBDzG-d3ct','_sukbTUQ8dxvRGFeeSesP');
INSERT INTO "proposal_comments" VALUES('giD3r5a_Gid5Lvu7ssu4P','_sukbTUQ8dxvRGFeeSesP');
INSERT INTO "proposal_comments" VALUES('r8xwDRWU5sAdH6UsNFl8U','_sukbTUQ8dxvRGFeeSesP');
CREATE TABLE `comment_likes` (
	`comment_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`created_time` text NOT NULL,
	PRIMARY KEY(`comment_id`, `guest_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "comment_likes" VALUES('fmMbl5oKu_OPy9YAoQUGD','IswnQbyqCn7NbXRsGsD2W','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('6kRDmC9kHx1cLl8kJyB4o','WBHNKMCNBmxx_MlTbJDAD','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('6kRDmC9kHx1cLl8kJyB4o','Csy_BmrogZyATJ0Rc-yVO','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('6kRDmC9kHx1cLl8kJyB4o','5i9i_3GcjIBT09rfaKCJZ','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('IGDaGvkCEGuldvyD2kjrl','Csy_BmrogZyATJ0Rc-yVO','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('IGDaGvkCEGuldvyD2kjrl','5i9i_3GcjIBT09rfaKCJZ','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('G7znTtk_SjrcsUutIrTgP','5i9i_3GcjIBT09rfaKCJZ','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('G7znTtk_SjrcsUutIrTgP','7ZOGrOLuXLRiOuIcv9flt','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('n7TdTDx-zGTsec9H456Hv','7ZOGrOLuXLRiOuIcv9flt','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('n7TdTDx-zGTsec9H456Hv','ApV8IbWBVTVCMdBfaJ48D','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('n7TdTDx-zGTsec9H456Hv','mansprtxW1DJ8XKr1ZxbH','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('O68DGM5VhGMZLq6xdHPjs','ApV8IbWBVTVCMdBfaJ48D','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('QmznXv4hraRwRuLuqU4z-','mansprtxW1DJ8XKr1ZxbH','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('Ap9KjS-dWdPUryJgoKL7Z','dPXqkWHGi5eRm0TkIN1T_','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('Ap9KjS-dWdPUryJgoKL7Z','W6jSzvl_D_aDAYrsRkkxU','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('4N3bRPVm52GqUJBT_S9iZ','W6jSzvl_D_aDAYrsRkkxU','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('DkpI94SYybpXkn7EDGyab','YX2l5gVowbAVoY-CXUskE','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('DkpI94SYybpXkn7EDGyab','m69ckm5IrsgDvpRPsTKNV','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('DkpI94SYybpXkn7EDGyab','mQSmJ-VPBgUK2gDV2ZITJ','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('wiKwTsditzlasSUaDU0P1','m69ckm5IrsgDvpRPsTKNV','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('wiKwTsditzlasSUaDU0P1','mQSmJ-VPBgUK2gDV2ZITJ','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('QRe8D_LbnB46OMUpWakVb','mQSmJ-VPBgUK2gDV2ZITJ','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('QRe8D_LbnB46OMUpWakVb','felLPYPQshS_hYQoeLaT_','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('QRe8D_LbnB46OMUpWakVb','HMR8n7D_C5zGxoQtoKE7D','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('KpcjnJguyTnmQJUcre187','felLPYPQshS_hYQoeLaT_','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('KpcjnJguyTnmQJUcre187','HMR8n7D_C5zGxoQtoKE7D','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('0MaLUDB5iU-ddGGtjS8z3','pJgBPKmbjinvqjurguDSG','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('shSsO2VJ8P3Kjs8z3-skU','I3NLsVdMJlvCaUmloWg_m','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('shSsO2VJ8P3Kjs8z3-skU','jkh2TC9UTQ5jXzqfwLizh','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('shSsO2VJ8P3Kjs8z3-skU','CfYfMK2hR4gMF1bz13sRM','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('-x9fIKy-bu7fZT1gvEBW9','jkh2TC9UTQ5jXzqfwLizh','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('yy3IIxrLFFXEjT-qiBl16','CfYfMK2hR4gMF1bz13sRM','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('yy3IIxrLFFXEjT-qiBl16','eUTS7VZUHxRztCDUt5rxe','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('yy3IIxrLFFXEjT-qiBl16','ErnEvyixQnkAvuVAh4bv6','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('37fQu862XgX57tVCwyGl5','eUTS7VZUHxRztCDUt5rxe','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('37fQu862XgX57tVCwyGl5','ErnEvyixQnkAvuVAh4bv6','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('oWPbvWQJEDk09euwqs3pO','ErnEvyixQnkAvuVAh4bv6','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('s4AnSRUrGN-X8qyH6FgSg','CiX9cRrwJiGHFqt1To2vX','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('uaOHWFF2Xfxjwxai04pr9','HBaMqp-NtQJctBdn2oCbS','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('wuiiuii-RdFxuzFAkLhsI','MuwFQb2m-Ux3Zpq27RA5J','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('wuiiuii-RdFxuzFAkLhsI','NjfILIKw5lpMwE8wIm9rw','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('wuiiuii-RdFxuzFAkLhsI','tMTYBscBvrY3UzeU96E8X','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('iGMcbxeewvLy-QtU2KB2F','NjfILIKw5lpMwE8wIm9rw','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('iGMcbxeewvLy-QtU2KB2F','tMTYBscBvrY3UzeU96E8X','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('urX4reFvFyrCjJ3ekrXI1','tMTYBscBvrY3UzeU96E8X','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('urX4reFvFyrCjJ3ekrXI1','spQSZeX7xXbnA8PdFDn4t','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('urX4reFvFyrCjJ3ekrXI1','wlcahNVNIVSc54-_Yj_6K','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('LzLtLQ061fST8JqdSWSeo','spQSZeX7xXbnA8PdFDn4t','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('hbpQkJ4JG0imH1iFm58ZA','QP-lEjBteOzXVC_SwiB38','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('hfObCeSkhTyNX4andCjxy','QP-lEjBteOzXVC_SwiB38','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('hfObCeSkhTyNX4andCjxy','8Y4m2fOhOxAi1OQk9dv7m','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('J6NhW-HRRAI9ZuHuYX1CG','8Y4m2fOhOxAi1OQk9dv7m','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('mQG83002QJV8a_E0oyMJT','ZEWIRXSjbqW_a6Cpdax7W','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('xn6hclIzfMPnBDzG-d3ct','n1q2bwTgEUk3zrC9wnF4-','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('xn6hclIzfMPnBDzG-d3ct','sJ9x5dTy1G3354WUz-PBl','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('xn6hclIzfMPnBDzG-d3ct','KH3xfoA5aQ0nM18lsn-eI','2026-10-04T08:56:28.108Z');
INSERT INTO "comment_likes" VALUES('giD3r5a_Gid5Lvu7ssu4P','sJ9x5dTy1G3354WUz-PBl','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('r8xwDRWU5sAdH6UsNFl8U','KH3xfoA5aQ0nM18lsn-eI','2026-10-04T08:58:28.108Z');
INSERT INTO "comment_likes" VALUES('r8xwDRWU5sAdH6UsNFl8U','lRV_MMuPjX6NqTuMfEa2W','2026-10-04T08:57:28.108Z');
INSERT INTO "comment_likes" VALUES('r8xwDRWU5sAdH6UsNFl8U','IswnQbyqCn7NbXRsGsD2W','2026-10-04T08:56:28.108Z');
CREATE TABLE `session_comments`
(
  `comment_id` text PRIMARY KEY NOT NULL,
  `session_id` text             NOT NULL,
  FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `profile_comments`
(
  `comment_id` text PRIMARY KEY NOT NULL,
  `profile_id` text             NOT NULL,
  FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`profile_id`) REFERENCES `guests` (`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `meeting_availability` (
	`event_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`slot_start` text NOT NULL,
	PRIMARY KEY(`event_id`, `guest_id`, `slot_start`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-16T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','KH3xfoA5aQ0nM18lsn-eI','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','WBHNKMCNBmxx_MlTbJDAD','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','7ZOGrOLuXLRiOuIcv9flt','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','dPXqkWHGi5eRm0TkIN1T_','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','YX2l5gVowbAVoY-CXUskE','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','felLPYPQshS_hYQoeLaT_','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','I3NLsVdMJlvCaUmloWg_m','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','eUTS7VZUHxRztCDUt5rxe','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','HBaMqp-NtQJctBdn2oCbS','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','tMTYBscBvrY3UzeU96E8X','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','-co1SIEViS_74Nne7F_tn','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','QP-lEjBteOzXVC_SwiB38','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','ZEWIRXSjbqW_a6Cpdax7W','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('CEeA7A1EGNKg4ElF256p4','sJ9x5dTy1G3354WUz-PBl','2026-11-17T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','KH3xfoA5aQ0nM18lsn-eI','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','WBHNKMCNBmxx_MlTbJDAD','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','7ZOGrOLuXLRiOuIcv9flt','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','dPXqkWHGi5eRm0TkIN1T_','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','YX2l5gVowbAVoY-CXUskE','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','felLPYPQshS_hYQoeLaT_','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','I3NLsVdMJlvCaUmloWg_m','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','eUTS7VZUHxRztCDUt5rxe','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','HBaMqp-NtQJctBdn2oCbS','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','tMTYBscBvrY3UzeU96E8X','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','-co1SIEViS_74Nne7F_tn','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','QP-lEjBteOzXVC_SwiB38','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','ZEWIRXSjbqW_a6Cpdax7W','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('ahNcYyOhWe34CsrVdaPJ2','sJ9x5dTy1G3354WUz-PBl','2026-11-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T12:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T12:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','KH3xfoA5aQ0nM18lsn-eI','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','WBHNKMCNBmxx_MlTbJDAD','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','7ZOGrOLuXLRiOuIcv9flt','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','dPXqkWHGi5eRm0TkIN1T_','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','YX2l5gVowbAVoY-CXUskE','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','felLPYPQshS_hYQoeLaT_','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','I3NLsVdMJlvCaUmloWg_m','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','eUTS7VZUHxRztCDUt5rxe','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','HBaMqp-NtQJctBdn2oCbS','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','QP-lEjBteOzXVC_SwiB38','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','ZEWIRXSjbqW_a6Cpdax7W','2026-10-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','2026-10-20T14:30:00.000Z');
CREATE TABLE `meeting_points` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meeting_points" VALUES('BdtJDcFOHnKYQZba7mGB4','CEeA7A1EGNKg4ElF256p4','Coffee bar','By the main staircase, open all day.',0);
INSERT INTO "meeting_points" VALUES('UOOAS0zCb0tOlqDEtdkkq','CEeA7A1EGNKg4ElF256p4','Garden bench','Behind the kitchen, weather permitting.',1);
INSERT INTO "meeting_points" VALUES('Um9Ml74ELK6EIUZHu_QVQ','ahNcYyOhWe34CsrVdaPJ2','Coffee bar','By the main staircase, open all day.',0);
INSERT INTO "meeting_points" VALUES('arTM5phZxZUPuekyLbDCa','ahNcYyOhWe34CsrVdaPJ2','Garden bench','Behind the kitchen, weather permitting.',1);
INSERT INTO "meeting_points" VALUES('VQIhClea5RVNY_nns8J80','fHvlvt0u4u_ipYdqvYykd','Coffee bar','By the main staircase, open all day.',0);
INSERT INTO "meeting_points" VALUES('CZuftkTU3qxJKrqFOLfU4','fHvlvt0u4u_ipYdqvYykd','Garden bench','Behind the kitchen, weather permitting.',1);
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`slot_start` text NOT NULL,
	`slot_end` text NOT NULL,
	`meeting_point` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`responded_at` text, `cancel_note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requester_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meetings" VALUES('TlXWNGxTN8bghsjfl0bJw','fHvlvt0u4u_ipYdqvYykd','sJ9x5dTy1G3354WUz-PBl','C0HmEuvkIpc1gF1giGvwa','2026-10-18T08:00:00.000Z','2026-10-18T08:30:00.000Z','Coffee bar','Container queries, and where they still bite.','accepted','2026-10-04T09:58:28.353Z','2026-10-04T09:58:28.353Z','');
INSERT INTO "meetings" VALUES('epp2n7lPXRmWcsPAgVYDy','fHvlvt0u4u_ipYdqvYykd','tMTYBscBvrY3UzeU96E8X','C0HmEuvkIpc1gF1giGvwa','2026-10-18T08:00:00.000Z','2026-10-18T08:30:00.000Z','Garden bench','Could I steal you for the same half hour?','pending','2026-10-04T09:58:28.353Z',NULL,'');
INSERT INTO "meetings" VALUES('2zayl45SWMDLj_p91tFjY','fHvlvt0u4u_ipYdqvYykd','wlcahNVNIVSc54-_Yj_6K','C0HmEuvkIpc1gF1giGvwa','2026-10-18T09:00:00.000Z','2026-10-18T09:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-10-04T09:58:28.353Z',NULL,'');
INSERT INTO "meetings" VALUES('bUXk4G7JGHQNK6u_05Zef','fHvlvt0u4u_ipYdqvYykd','-co1SIEViS_74Nne7F_tn','C0HmEuvkIpc1gF1giGvwa','2026-10-18T09:00:00.000Z','2026-10-18T09:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-10-04T09:58:28.353Z',NULL,'');
INSERT INTO "meetings" VALUES('F65IFn7nTSOX5ghamQ3zc','fHvlvt0u4u_ipYdqvYykd','4gutz55F-QHGfFPFfdjwv','C0HmEuvkIpc1gF1giGvwa','2026-10-18T09:00:00.000Z','2026-10-18T09:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-10-04T09:58:28.353Z',NULL,'');
INSERT INTO "meetings" VALUES('PjmnJ41tFR3dXNYYIwtgi','fHvlvt0u4u_ipYdqvYykd','C0HmEuvkIpc1gF1giGvwa','QP-lEjBteOzXVC_SwiB38','2026-10-18T13:30:00.000Z','2026-10-18T14:00:00.000Z','Garden bench','Keen to hear how you run your platform team.','accepted','2026-10-04T09:58:28.353Z','2026-10-04T09:58:28.353Z','');
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text NOT NULL,
	`read_at` text,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `push_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`created_at` text NOT NULL
);
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `session_reminders` (
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`kind` text NOT NULL,
	`due_time` text NOT NULL,
	`claimed_at` text,
	`sent_at` text,
	`first_failed_at` text,
	`notified_at` text,
	PRIMARY KEY(`session_id`, `guest_id`, `kind`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `location_unavailability` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `changes` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`event_id` text,
	`type` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`occurred_at` text NOT NULL,
	`payload` text NOT NULL
);
CREATE TABLE `job_leases` (
	`name` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`expires_at` text NOT NULL
);
CREATE TABLE `job_cursors` (
	`name` text PRIMARY KEY NOT NULL,
	`seq` integer NOT NULL
);
CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`channel` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text,
	`first_failed_at` text,
	`last_error` text,
	`sent_at` text,
	`abandoned_at` text,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `votes_proposal_guest_unique` ON `votes` (`proposal_id`,`guest_id`);
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);
CREATE UNIQUE INDEX `rsvps_session_guest_unique` ON `rsvps` (`session_id`,`guest_id`);
CREATE UNIQUE INDEX `guests_email_unique` ON `guests` (lower("email"));
CREATE INDEX `proposal_comments_proposal_idx` ON `proposal_comments` (`proposal_id`);
CREATE INDEX `comment_likes_guest_idx` ON `comment_likes` (`guest_id`);
CREATE INDEX `session_comments_session_idx` ON `session_comments` (`session_id`);
CREATE INDEX `profile_comments_profile_idx` ON `profile_comments` (`profile_id`);
CREATE INDEX `meeting_availability_slot_idx` ON `meeting_availability` (`event_id`,`slot_start`);
CREATE INDEX `meeting_points_event_idx` ON `meeting_points` (`event_id`);
CREATE INDEX `meetings_event_requester_idx` ON `meetings` (`event_id`,`requester_id`);
CREATE INDEX `meetings_event_recipient_idx` ON `meetings` (`event_id`,`recipient_id`);
CREATE INDEX `notifications_guest_created_idx` ON `notifications` (`guest_id`,`created_at`);
CREATE INDEX `notifications_guest_read_idx` ON `notifications` (`guest_id`,`read_at`);
CREATE UNIQUE INDEX `meetings_no_duplicate_request` ON `meetings` (`event_id`,`requester_id`,`recipient_id`,`slot_start`) WHERE "meetings"."status" in ('pending', 'accepted');
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);
CREATE INDEX `push_subscriptions_guest_idx` ON `push_subscriptions` (`guest_id`);
CREATE INDEX `session_reminders_session_idx` ON `session_reminders` (`session_id`);
CREATE INDEX `location_unavailability_event_idx` ON `location_unavailability` (`event_id`);
CREATE UNIQUE INDEX `changes_id_unique` ON `changes` (`id`);
CREATE INDEX `changes_event_seq_idx` ON `changes` (`event_id`,`seq`);
CREATE INDEX `changes_subject_idx` ON `changes` (`subject_type`,`subject_id`,`seq`);
CREATE INDEX `deliveries_due_idx` ON `deliveries` (`sent_at`,`abandoned_at`);
CREATE INDEX `deliveries_guest_idx` ON `deliveries` (`guest_id`);
COMMIT;
