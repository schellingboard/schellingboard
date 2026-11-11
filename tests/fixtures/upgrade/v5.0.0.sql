-- Seeded database of schellingboard v5.0.0, dumped by
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
INSERT INTO "__drizzle_migrations" VALUES(NULL,'da2abac372123d1c9f7ea710afd235ded5569e6429080b850c904b88e65696d7',1791106486616);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'f86c3692e1cae512bea94d485c79300c43ec677e954983f81447e6a373972066',1791280941952);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'766e9514033184a60451d89b98ff42d81f6f8f66a24fbbfc31101c2892d8d59d',1791287309200);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'2787507b85023d0aea19f51abba4d64f348e38f4776fb1132e639306be4842f0',1791349868417);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'65b325a0d787c9d65d1e10823d45360387cdd3e579851ac34a15c0c7931e8ed2',1791351995799);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'0c8194d09a5ca02f5adfa95dba9339e22d48b6e923d8d31f4ed76bbd844eda9a',1791372946149);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'4a39efc3b167d14464ffcd0eb37be46455f3966b5dbdc0379993baf3a04a846f',1793213459551);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'3438b6ab5199f0c56bca43fda8165363be56a26ed99ab9c473fa87bad6964da3',1793345256625);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'f18b3fd061b148f1914df88e16588144fcf6b8cda3959e764d34e5cecae6819e',1793359031043);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d3904a6edb0db500675530ab38cace9f4bbf68c47bb38d66f85510359b9e60f0',1793528204308);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'668f034738daabe5163d80df96afd319a537911bd11f927863cdc062ac0f214f',1793535062449);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'fcaa363c59009083fcb0cb595c9a5054651aa73a8b7edf27630d092b97cdaba6',1793785630020);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'6c25152eaf43b54b3d861092bd838f21f8ef6e143102a1854f4df1b05fa48f09',1793788635197);
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
, `version` integer DEFAULT 1 NOT NULL);
INSERT INTO "locations" VALUES('loc-main-hall','Main Hall','/locations/loc-main-hall.jpg','Our largest venue, featuring a professional stage with tiered seating. Equipped with full AV including projector and sound system. Ideal for keynotes, panels, and large-audience sessions.',100,'blue',1,1,'Ground floor, East Wing',1);
INSERT INTO "locations" VALUES('loc-room-a','Workshop Room','/locations/loc-room-a.jpg','A bright breakout room with whiteboards and flexible seating. Natural light and a relaxed atmosphere make it well suited for workshops and interactive sessions.',30,'green',1,2,'1st floor, West Wing',1);
INSERT INTO "locations" VALUES('loc-room-b','Garden Terrace','/locations/loc-room-b.jpg','An informal outdoor space with picnic tables overlooking the lake. Perfect for open-space sessions, unconference discussions, and casual networking.',25,'red',1,3,'Outdoor, South Courtyard',1);
INSERT INTO "locations" VALUES('loc-library','Reading Room','/locations/loc-library.jpg','A quiet, book-lined room with a grand skylight and long communal tables. Great for focused breakout sessions or attendees who need a calm space to work between talks.',40,'amber',1,4,'2nd floor, North Wing',1);
INSERT INTO "locations" VALUES('loc-boardroom','Boardroom','/locations/loc-boardroom.jpg','A compact meeting room with a glass-walled conference table and video conferencing setup. Well suited for small-group discussions, interviews, or sponsor meetings.',10,'indigo',1,5,'1st floor, East Wing',1);
INSERT INTO "locations" VALUES('loc-auditorium','Auditorium','/locations/loc-auditorium.jpg','A tiered lecture theatre with fixed seating and a large presentation screen. Best for high-attendance keynotes and formal talks that don''t need audience interaction.',200,'orange',1,6,'Ground floor, West Wing',1);
INSERT INTO "locations" VALUES('loc-courtyard','Courtyard','/locations/loc-courtyard.jpg','A dramatic covered courtyard framed by stone arches, open to the sky above. Works well as a striking gathering point between sessions or a quiet spot to reflect.',50,'sky',1,7,'Ground floor, Central Courtyard',1);
INSERT INTO "locations" VALUES('loc-rooftop','Rooftop Terrace','/locations/loc-rooftop.jpg','An open-air rooftop space with skyline views and casual seating. Ideal for informal chats, evening socials, or breakout conversations away from the main venue.',20,'teal',1,8,'Rooftop, East Wing',1);
CREATE TABLE "days" (
	`id` text PRIMARY KEY NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`start_bookings` text NOT NULL,
	`end_bookings` text NOT NULL,
	`event_id` text NOT NULL, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "days" VALUES('9fQBnyTFtEVQC8phZbV7e','2026-12-23T08:00:00.000Z','2026-12-23T17:00:00.000Z','2026-12-23T08:00:00.000Z','2026-12-23T16:30:00.000Z','-D7eLgFNVCGXbS6sFHxT5',1);
INSERT INTO "days" VALUES('PB7n1OuRfWatQQJ5AP5dU','2026-12-24T08:00:00.000Z','2026-12-24T17:00:00.000Z','2026-12-24T08:00:00.000Z','2026-12-24T16:30:00.000Z','-D7eLgFNVCGXbS6sFHxT5',1);
INSERT INTO "days" VALUES('gXVlCdHoYlV3HzKnVVCdw','2026-12-25T08:00:00.000Z','2026-12-25T17:00:00.000Z','2026-12-25T08:00:00.000Z','2026-12-25T16:30:00.000Z','-D7eLgFNVCGXbS6sFHxT5',1);
INSERT INTO "days" VALUES('eN4vpRYXJ36hn7nYkU1Vh','2026-12-09T08:00:00.000Z','2026-12-09T17:00:00.000Z','2026-12-09T08:00:00.000Z','2026-12-09T16:30:00.000Z','AycNOr2kRijxOeqMKZp6N',1);
INSERT INTO "days" VALUES('iFtgcQSQ6sVyA-XL99ROP','2026-12-10T08:00:00.000Z','2026-12-10T17:00:00.000Z','2026-12-10T08:00:00.000Z','2026-12-10T16:30:00.000Z','AycNOr2kRijxOeqMKZp6N',1);
INSERT INTO "days" VALUES('_j1wv-WJMe3qko189JD1a','2026-12-11T08:00:00.000Z','2026-12-11T17:00:00.000Z','2026-12-11T08:00:00.000Z','2026-12-11T16:30:00.000Z','AycNOr2kRijxOeqMKZp6N',1);
INSERT INTO "days" VALUES('O8eK1p5yWCoNTgazY_9Ft','2026-11-25T08:00:00.000Z','2026-11-25T17:00:00.000Z','2026-11-25T08:00:00.000Z','2026-11-25T16:30:00.000Z','UYLjQ2vfV0lUt6zpqB92I',1);
INSERT INTO "days" VALUES('nBuvVAA8v5gPGSvL29PdJ','2026-11-26T08:00:00.000Z','2026-11-26T17:00:00.000Z','2026-11-26T08:00:00.000Z','2026-11-26T16:30:00.000Z','UYLjQ2vfV0lUt6zpqB92I',1);
INSERT INTO "days" VALUES('lJv8DpI-uZtmd0YM1l7vk','2026-11-27T08:00:00.000Z','2026-11-28T02:00:00.000Z','2026-11-27T08:00:00.000Z','2026-11-28T01:30:00.000Z','UYLjQ2vfV0lUt6zpqB92I',1);
CREATE TABLE "event_guests" (
	`event_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `guest_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','wuMh9z-507W06D0wglsAg');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','iGkaKua4rLriedEAt_MZe');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "event_guests" VALUES('-D7eLgFNVCGXbS6sFHxT5','Evm6mbn81YTanjg9i_IDy');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','wuMh9z-507W06D0wglsAg');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','iGkaKua4rLriedEAt_MZe');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "event_guests" VALUES('AycNOr2kRijxOeqMKZp6N','Evm6mbn81YTanjg9i_IDy');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','wuMh9z-507W06D0wglsAg');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','iGkaKua4rLriedEAt_MZe');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "event_guests" VALUES('UYLjQ2vfV0lUt6zpqB92I','Evm6mbn81YTanjg9i_IDy');
CREATE TABLE "event_locations" (
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `location_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-main-hall');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-room-a');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-room-b');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-library');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-boardroom');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-auditorium');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-courtyard');
INSERT INTO "event_locations" VALUES('-D7eLgFNVCGXbS6sFHxT5','loc-rooftop');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-main-hall');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-room-a');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-room-b');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-library');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-boardroom');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-auditorium');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-courtyard');
INSERT INTO "event_locations" VALUES('AycNOr2kRijxOeqMKZp6N','loc-rooftop');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-main-hall');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-room-a');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-room-b');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-library');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-boardroom');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-auditorium');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-courtyard');
INSERT INTO "event_locations" VALUES('UYLjQ2vfV0lUt6zpqB92I','loc-rooftop');
CREATE TABLE "proposal_hosts" (
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`proposal_id`, `guest_id`),
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_hosts" VALUES('EwOlntThYK7FVlIxHCdfA','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "proposal_hosts" VALUES('PHmbHeid0LEB0ixPuOr5g','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('Xb3Ab1wali9mTkzExMA9d','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "proposal_hosts" VALUES('LA0UTc5ecPCtQ4fR7t_jJ','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "proposal_hosts" VALUES('LA0UTc5ecPCtQ4fR7t_jJ','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "proposal_hosts" VALUES('ibHZmT0nk-Kul9Q-o6a93','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "proposal_hosts" VALUES('ibHZmT0nk-Kul9Q-o6a93','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "proposal_hosts" VALUES('q5Icf3gUPdHot08mgb-oV','wuMh9z-507W06D0wglsAg');
INSERT INTO "proposal_hosts" VALUES('zr8fpgelXiwm8z3hl-rri','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "proposal_hosts" VALUES('Yr3zzVZ5MVCbdXroCpDyu','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "proposal_hosts" VALUES('Z_lCfCQ3C35MQT7SEpZiA','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('ANDNcmgsucqi5tcALiSY6','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "proposal_hosts" VALUES('GTGowzhFye1nA4_DujHKM','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('ikBBD0o87itEYsGZqvr_T','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "proposal_hosts" VALUES('ikBBD0o87itEYsGZqvr_T','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "proposal_hosts" VALUES('ZlPL37zMomL_iTbQwa31c','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "proposal_hosts" VALUES('rq9oDRUSITLhePXn-2879','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "proposal_hosts" VALUES('K34rDMv8gGdW75wvsjUdM','wuMh9z-507W06D0wglsAg');
INSERT INTO "proposal_hosts" VALUES('W4NZWnMihokeCrP4FLCMV','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "proposal_hosts" VALUES('W4NZWnMihokeCrP4FLCMV','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "proposal_hosts" VALUES('SvoO3o7XGgklngR8ek-FD','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "proposal_hosts" VALUES('tozCWt2jSXx6BDU_C-Dux','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "proposal_hosts" VALUES('hT53A2RlU_Mslz44CqTpr','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('lX8qxH3xs1tBgjJNDlbcF','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "proposal_hosts" VALUES('_IfepNxpIdnAu06-zW_lA','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('31U8XRQQ8KX6X9uMUE8Tj','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "proposal_hosts" VALUES('miY3JUW-fRAEsE7JoRg9I','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "proposal_hosts" VALUES('sFaY19y0fc_kYDeAIxphd','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "proposal_hosts" VALUES('Asnej6V3vXniwIcJeL-iv','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "proposal_hosts" VALUES('9S7_RuWFCXZqFcMGm7sUj','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "proposal_hosts" VALUES('3jP4LS6De_73-__3qsoYC','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "proposal_hosts" VALUES('hCo6YM0JDwS7OUeusmzRG','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "proposal_hosts" VALUES('Kizq8EmvXGR-buAVPTVxb','iGkaKua4rLriedEAt_MZe');
INSERT INTO "proposal_hosts" VALUES('2WWSai5rKvKdVtMLauu4W','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "proposal_hosts" VALUES('T0vl6IHCkCI4FtjtbcLlF','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "proposal_hosts" VALUES('eO6NPsnTxvjPiD6g8jOa8','iShv18yQvprVcDvxCQmmA');
INSERT INTO "proposal_hosts" VALUES('_x7ZJyxlvtFtOyjWSyLOh','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "proposal_hosts" VALUES('LExhIDOlSStuRcwIiOoEe','wuMh9z-507W06D0wglsAg');
INSERT INTO "proposal_hosts" VALUES('Pza1FhINB26ILPRHXsJ6U','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "proposal_hosts" VALUES('BS_uBronCbKREa-yEEKkP','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "proposal_hosts" VALUES('BS_uBronCbKREa-yEEKkP','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "proposal_hosts" VALUES('1R64rynqAya5F7kCxNKGZ','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "proposal_hosts" VALUES('iA02gGEqR0ReOTj99g0nP','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "proposal_hosts" VALUES('QKz5ST--_eq7yHltpXK8-','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "proposal_hosts" VALUES('x9ZvfRHasYEgj2LLzeC4d','MZjJiKbO-RGkvrvSMlyHZ');
CREATE TABLE "rsvps" (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "rsvps" VALUES('BF-SwNWTvuE0jqS4hYV6f','TF8CWD0HSXPjvBhfiBq_H','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('qoejJE9rX8_HM4zLpM-68','25hZDqvtt-mI3Gybn_yOr','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('TCLHuwkksh6NA3QcJSzLI','JPUgkpWdrUEQL2tSFurQX','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('MWEb7tVX69vfEH00Xh4PW','8jkog8QWIvGrZQthOxeRD','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('CSoGA52SWFIyL48WD_KkU','2XiEUym2eyJE7437hicyP','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('2GU-HDJcej64qpi7_vT1c','UyCjYnsr2PNDgf2y1_3q2','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "rsvps" VALUES('4hJa-iqA_8qltb9YEqiRS','lqEHzM6naNa1QUtKarB_9','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('y0J45zd3fWnWu6aDWHH91','7jn_r5fNOAoLvzybLSGvS','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('MFa58tHyVfrIWL-yBCMY1','TVCqKurF5iJYaX2VQCJOq','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('aWC2YLihc8MZM2CboMD1R','4xJK7N6kK-HvKzjCTYzP7','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('I4PGJBDG8eOsf0I1zYqHb','2XiEUym2eyJE7437hicyP','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('9esvplRkvT2Ylzc_8ZBhE','Qz77siaU6Au34k-MT-kEs','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "rsvps" VALUES('1DUHCS_GLi841J64C1RLs','JPUgkpWdrUEQL2tSFurQX','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "rsvps" VALUES('DXlaMNxr4dwjNsst-XEh0','aW3SSczqWM_rte9wglKrE','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "rsvps" VALUES('A4HSlHhotqU4Na4dlw6SX','7TbZvUTKrbYopR-QgFp3y','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "rsvps" VALUES('bhiE8DtCxmA-BFWE8yZa9','UyCjYnsr2PNDgf2y1_3q2','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "rsvps" VALUES('BU8gk2ywcTl7o_uzuLvgt','JPUgkpWdrUEQL2tSFurQX','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "rsvps" VALUES('6xllPgznEeZACRIhQp7wQ','TVCqKurF5iJYaX2VQCJOq','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "rsvps" VALUES('q8UyslyFokue3wef3m3u1','aW3SSczqWM_rte9wglKrE','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "rsvps" VALUES('0XlNyS0CUpyZJ_DQj0G0S','0UyRbeLlVU_6KKIgTth3k','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "rsvps" VALUES('ahOq2ViXCcVAtzkICCsHY','Qz77siaU6Au34k-MT-kEs','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "rsvps" VALUES('UrZ043BxDcy6WRKbGA2Ro','TF8CWD0HSXPjvBhfiBq_H','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "rsvps" VALUES('vMJlsWdsthSGal0bNlBPJ','7jn_r5fNOAoLvzybLSGvS','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "rsvps" VALUES('OxanOSrRjVK-3MhfgLC7f','IeVRrak7i_3Kt_p1b4Q-b','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "rsvps" VALUES('5pVFbnOvLXkCrY1cvJqek','0UyRbeLlVU_6KKIgTth3k','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "rsvps" VALUES('33gAU4VDjDztEvfqz4kXL','dR--X9EH-_rfZiT4kCAh1','Wk7lndCBEZJn1NY-SjFz0');
INSERT INTO "rsvps" VALUES('Th6cjI96X2ZkrY2HjI-iR','TF8CWD0HSXPjvBhfiBq_H','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('0Gjb7qXSmT0X7Ud4H7qzR','7jn_r5fNOAoLvzybLSGvS','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('vs9EzI6FX5cCKnNix2rwK','TVCqKurF5iJYaX2VQCJOq','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('Jio1FYImyzXI3PpNbL4Dt','aW3SSczqWM_rte9wglKrE','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('lrdk-CmjcViQzffWTzN2H','7TbZvUTKrbYopR-QgFp3y','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('4gq89vp0HXvsc_OXZOZmD','u8XicmKS_DxHyRKM0ebga','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('K6urJZ6hB_oS-8RNXTQQr','2XiEUym2eyJE7437hicyP','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('kxSG4TkrtNj4SkCmnXgve','Qz77siaU6Au34k-MT-kEs','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "rsvps" VALUES('XVi1H1Y-8c_aycEb5wy3v','TF8CWD0HSXPjvBhfiBq_H','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('eeYSRbEMzqXTq-BpmwWzS','JPUgkpWdrUEQL2tSFurQX','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('LLv4axadj31AUKcuD5MCH','TVCqKurF5iJYaX2VQCJOq','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('yhDsKXP__s-VljFzb_IgR','u8XicmKS_DxHyRKM0ebga','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('ds4BzBDMDFvU49iTA4Zki','uT9nu0FJ-rIu4YzOfttLw','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('yUhUJ8PPRtf7c8ysvSiO3','dR--X9EH-_rfZiT4kCAh1','yiwyv5a_bWUh_YLq3wV7_');
INSERT INTO "rsvps" VALUES('yQWNdTVOuMB_hdyJoheyR','TF8CWD0HSXPjvBhfiBq_H','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('oVE3cmf1OKAjTNEBUthHK','7jn_r5fNOAoLvzybLSGvS','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('uR5e787vqn0DOW8KxlbSZ','IeVRrak7i_3Kt_p1b4Q-b','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('HWyJxyWnRcrEzJYuZ3lLu','8jkog8QWIvGrZQthOxeRD','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('8tQIyHzIGkuuCtU5lT6KS','ghV6TCMqNZE_EsWPoUjCJ','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('aDd-iu2QCFY-TwClqF-27','UyCjYnsr2PNDgf2y1_3q2','wuMh9z-507W06D0wglsAg');
INSERT INTO "rsvps" VALUES('HFynfMJmYZNmbZ4fed0yG','lqEHzM6naNa1QUtKarB_9','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('t0uraeZYfLg02krfmW2wg','7jn_r5fNOAoLvzybLSGvS','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('BN7b3cGaopcAweCRxYmik','IeVRrak7i_3Kt_p1b4Q-b','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('CGq7CtLdmnnQPMLCzQ__R','4xJK7N6kK-HvKzjCTYzP7','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('l0hCiGh8pBjvbSr4j_8YA','ghV6TCMqNZE_EsWPoUjCJ','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('gUeTr5-nir7kp-I4lMzn4','UyCjYnsr2PNDgf2y1_3q2','Ocs_eOqCR0_EEXAuI55Fg');
INSERT INTO "rsvps" VALUES('g041G_nQgXOVsv7zTq9aU','7jn_r5fNOAoLvzybLSGvS','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "rsvps" VALUES('s-LB6zdY47YhnYejQVfAF','4xJK7N6kK-HvKzjCTYzP7','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "rsvps" VALUES('SAJuiwe7_a1l9J99l7lbh','7TbZvUTKrbYopR-QgFp3y','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "rsvps" VALUES('--5C8x0Xi2v_CsJsGjVUB','2XiEUym2eyJE7437hicyP','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "rsvps" VALUES('o3qJ6uO4BOWXGI-JP72DN','7jn_r5fNOAoLvzybLSGvS','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('7gkgScHJTUoyJQETCy_75','TVCqKurF5iJYaX2VQCJOq','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('rnUmqjPtZ7O_TQqFhhvFi','4xJK7N6kK-HvKzjCTYzP7','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('h6CH-_-yhcPU93Bam00mk','8jkog8QWIvGrZQthOxeRD','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('BV9DkjiL36hIy6Zido60a','ghV6TCMqNZE_EsWPoUjCJ','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('rZNHpwBCVcEseS9vS2evn','uT9nu0FJ-rIu4YzOfttLw','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('_wTi8NNdSbtrWg3HOHNq2','Qz77siaU6Au34k-MT-kEs','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "rsvps" VALUES('bT2t1kSc550KmUWgNwkr1','TF8CWD0HSXPjvBhfiBq_H','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('sFDp34JCpgE8ROrz0irMj','25hZDqvtt-mI3Gybn_yOr','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('ScAZJwG3KreipXIBdYpVo','aW3SSczqWM_rte9wglKrE','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('hOizfgHo_djUadBS8DPda','7TbZvUTKrbYopR-QgFp3y','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('RPx943O93Ykp91njAZYMk','8jkog8QWIvGrZQthOxeRD','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('Me6A6tYYVqdUsw2CeRTOa','dR--X9EH-_rfZiT4kCAh1','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('3oAcOC_rV265sOAy_ZnFV','Qz77siaU6Au34k-MT-kEs','p7eh7GiHs_WQ0SmyqQ2rs');
INSERT INTO "rsvps" VALUES('TyEtZwCkMBuy9djnZ_AU9','TF8CWD0HSXPjvBhfiBq_H','iShv18yQvprVcDvxCQmmA');
INSERT INTO "rsvps" VALUES('4KElTVKe0NHlA9hAEOQy1','7jn_r5fNOAoLvzybLSGvS','iShv18yQvprVcDvxCQmmA');
INSERT INTO "rsvps" VALUES('8GTK6F0QkjPP0P2Hs4de-','Qz77siaU6Au34k-MT-kEs','iShv18yQvprVcDvxCQmmA');
INSERT INTO "rsvps" VALUES('wzUCNbn16l8SoEZB1Cdqo','TF8CWD0HSXPjvBhfiBq_H','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "rsvps" VALUES('VxWX_2HTyVcbSrlZfoYYN','uT9nu0FJ-rIu4YzOfttLw','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "rsvps" VALUES('q0xm5KL1BQ0jei1Fuugg0','UyCjYnsr2PNDgf2y1_3q2','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "rsvps" VALUES('TKdOIvs-TzX4oAIQzwgaQ','TF8CWD0HSXPjvBhfiBq_H','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('UIoWzeoM3yi_G2zqH9hdW','7jn_r5fNOAoLvzybLSGvS','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('7HVrHBgzB0uyjNrfWHwgF','4xJK7N6kK-HvKzjCTYzP7','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('lWzDRT0jTvPgpBJ9etrfV','0UyRbeLlVU_6KKIgTth3k','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('wxxNBt9CCmBt1rqI7HO6o','8jkog8QWIvGrZQthOxeRD','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('XGR3vcSwDqp995L0G-A0f','Qz77siaU6Au34k-MT-kEs','u_uY2Tj4Y3FV2i-A6PG9P');
INSERT INTO "rsvps" VALUES('Q_5cQtVpQ5GYzg0xH5bKg','7TbZvUTKrbYopR-QgFp3y','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "rsvps" VALUES('a6VkYekTpoNEcYrMpzQLe','8jkog8QWIvGrZQthOxeRD','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "rsvps" VALUES('QKBGVOR_KLgG8Mn4eGhMU','uT9nu0FJ-rIu4YzOfttLw','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "rsvps" VALUES('ZdAN4GSDwLiGZKlJCE4XP','dR--X9EH-_rfZiT4kCAh1','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "rsvps" VALUES('yO6efai5FsehjwXccg9Mg','TF8CWD0HSXPjvBhfiBq_H','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('yR0OkJHm3a12dQe6GIv_w','25hZDqvtt-mI3Gybn_yOr','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('fYJ_CNaCjyGMrfqC__bSG','7jn_r5fNOAoLvzybLSGvS','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('xtPkOuNk3TlYWqLrK2oaT','aW3SSczqWM_rte9wglKrE','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('CyH9gCyKiArdw0Nm3Y2_R','u8XicmKS_DxHyRKM0ebga','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('W886U1GL-ipO_dnOkO5xA','dR--X9EH-_rfZiT4kCAh1','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('K3FoqrBni1Up9CuiVg2ql','Qz77siaU6Au34k-MT-kEs','Fd3gPLbxQVivweWTS2OYu');
INSERT INTO "rsvps" VALUES('e8LXSZngGajgIBZt507cq','TF8CWD0HSXPjvBhfiBq_H','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "rsvps" VALUES('RlGKs-c3L7Yafq50aYABD','25hZDqvtt-mI3Gybn_yOr','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "rsvps" VALUES('kCSoj-LLptfKrC-lEaV72','ghV6TCMqNZE_EsWPoUjCJ','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "rsvps" VALUES('ZUmj7eZJfvXG3QRnEU7bs','2XiEUym2eyJE7437hicyP','nwkMQXuSCjcT2u-kd5dLs');
INSERT INTO "rsvps" VALUES('IauGcVr8Zcjumr5g2IRx7','TF8CWD0HSXPjvBhfiBq_H','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('F63-1o6KlgxlxVucKWdKE','25hZDqvtt-mI3Gybn_yOr','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('AvMtVMQrcZAQj3QhevZxi','IeVRrak7i_3Kt_p1b4Q-b','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('FfVLgYW5-jYQ0jQ3qOdXt','7TbZvUTKrbYopR-QgFp3y','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('VQiTqGbN5GuQxJgg9_6Ta','ghV6TCMqNZE_EsWPoUjCJ','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('irZ1G1MpUxfUxHsmnDdQx','uT9nu0FJ-rIu4YzOfttLw','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('RnP1VNO_U72d20_qyLuy_','dR--X9EH-_rfZiT4kCAh1','PZ6BrVj315Vvxw_nrYyZQ');
INSERT INTO "rsvps" VALUES('obmDwnQZQqd4RcaPTKw8e','25hZDqvtt-mI3Gybn_yOr','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('zHi73TS5XmrhWxeMcRo8h','JPUgkpWdrUEQL2tSFurQX','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('2VaUyKmtFooBEkdWjfc4M','aW3SSczqWM_rte9wglKrE','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('Zn2B-ARC8aZf7Yhr2arqI','0UyRbeLlVU_6KKIgTth3k','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('Ink93lGOMfH1CIKXsa4SO','2XiEUym2eyJE7437hicyP','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('vHPbbL_5rqULhuRfquUdC','UyCjYnsr2PNDgf2y1_3q2','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('SyXtE-7yCt_yrLS3mLUT1','Qz77siaU6Au34k-MT-kEs','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "rsvps" VALUES('IEO8mJLJ0apym-7ZeOW6P','lqEHzM6naNa1QUtKarB_9','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "rsvps" VALUES('EqzzUbQZnnGowD4erhDVE','aW3SSczqWM_rte9wglKrE','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "rsvps" VALUES('Q-u5vitgyesIdY56oNZeo','7TbZvUTKrbYopR-QgFp3y','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "rsvps" VALUES('hQhNL6Pu1GaJHn1hS26px','ghV6TCMqNZE_EsWPoUjCJ','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "rsvps" VALUES('YhV6xxPSRQP735dT-D-ma','uT9nu0FJ-rIu4YzOfttLw','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "rsvps" VALUES('OeQCwtyJA7k34va5ijSql','TF8CWD0HSXPjvBhfiBq_H','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "rsvps" VALUES('IPZGJDw22riUBcj2pc-jN','JPUgkpWdrUEQL2tSFurQX','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "rsvps" VALUES('AinoBcfbfGMWkKkNB6qpW','0UyRbeLlVU_6KKIgTth3k','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "rsvps" VALUES('HlfIKr9uFLoCWplHbDpjy','uT9nu0FJ-rIu4YzOfttLw','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "rsvps" VALUES('XnL1hszdfXNEIlq4LmlGQ','Qz77siaU6Au34k-MT-kEs','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "rsvps" VALUES('l1XTJFwIxA4plLThiwr8M','25hZDqvtt-mI3Gybn_yOr','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "rsvps" VALUES('bjlU5wGc3uC43CTkhS9h3','7jn_r5fNOAoLvzybLSGvS','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "rsvps" VALUES('Pkxl3uhefiMDkQ49wLti4','aW3SSczqWM_rte9wglKrE','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "rsvps" VALUES('F9wtrMmqfi7hJDQtCcYQi','dR--X9EH-_rfZiT4kCAh1','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "rsvps" VALUES('zQyg8t2eIegq10F4VVTwJ','UyCjYnsr2PNDgf2y1_3q2','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "rsvps" VALUES('w_ED9HknUQl19cftWGaDF','25hZDqvtt-mI3Gybn_yOr','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('rpDep8cc3m-vNbzJDB42B','JPUgkpWdrUEQL2tSFurQX','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('4kHUdKhcFU03t42H7PjG1','IeVRrak7i_3Kt_p1b4Q-b','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('6HcgBeEnsDnBCPjlzD9_V','8jkog8QWIvGrZQthOxeRD','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('WKsfw0Pz9LXO9A985eNpB','ghV6TCMqNZE_EsWPoUjCJ','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('d6qGgvzIyq4kJLQSoAP6M','2XiEUym2eyJE7437hicyP','CxdYNzzd9zNg8WvWozhwl');
INSERT INTO "rsvps" VALUES('Mfq0JUeCQWGqrqQYlgFmF','TF8CWD0HSXPjvBhfiBq_H','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('vT_4HVcVJhsGfbn-r11N5','lqEHzM6naNa1QUtKarB_9','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('FaxvnVN9167ePhviOZJ4t','aW3SSczqWM_rte9wglKrE','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('dlM3WR4XjeorUB-ETBYRT','dR--X9EH-_rfZiT4kCAh1','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('hV0EHDDbzNcWaAQTBxpH8','UyCjYnsr2PNDgf2y1_3q2','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('EMZbbzM2QKrZ9u3NtPQJg','Qz77siaU6Au34k-MT-kEs','gV5Pdbxs5O1DABEVnyb57');
INSERT INTO "rsvps" VALUES('wFxUXMdN2vkcLBJdzDrkP','lqEHzM6naNa1QUtKarB_9','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('pxRxuL4Fzi9tyIYrQT_MC','7jn_r5fNOAoLvzybLSGvS','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('kjGCFpmmtulYRmAlwf0vt','8jkog8QWIvGrZQthOxeRD','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('Ii1iCt97IzgiHHIgq2dSF','ghV6TCMqNZE_EsWPoUjCJ','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('4NpetzeFEK3DUmfEe8Cfh','uT9nu0FJ-rIu4YzOfttLw','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('pYaakXBcf-_fZMCBP6iQb','2XiEUym2eyJE7437hicyP','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "rsvps" VALUES('Kl_wtmonAJvfK8semyFtU','TF8CWD0HSXPjvBhfiBq_H','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "rsvps" VALUES('wPWYU6KSh3dcHtRRpkyko','lqEHzM6naNa1QUtKarB_9','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "rsvps" VALUES('Zvl0kxdI72PoasG75T8ZG','aW3SSczqWM_rte9wglKrE','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "rsvps" VALUES('YOjLT815u_6IgeKlPvqzP','0UyRbeLlVU_6KKIgTth3k','YeG2otpf2ApAtRzLip5fA');
INSERT INTO "rsvps" VALUES('I2BTGYwiVpqGv35JZ_6_B','aW3SSczqWM_rte9wglKrE','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "rsvps" VALUES('wrRWdjRhWXlEuOR8fB0Cs','8jkog8QWIvGrZQthOxeRD','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "rsvps" VALUES('M-tIR8SkJr0kmprY4S_aO','dR--X9EH-_rfZiT4kCAh1','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "rsvps" VALUES('YfQ2zN3g6rfZX6ZECZoRL','Qz77siaU6Au34k-MT-kEs','1eJpl348zRLcRaHJ_UOpf');
INSERT INTO "rsvps" VALUES('k6sQ4IHKDi8bXjqN3HJV1','TF8CWD0HSXPjvBhfiBq_H','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('stijkf7ECsvI9uJ7JDTaX','aW3SSczqWM_rte9wglKrE','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('H83yRrpuSA1MaN4QwurSb','0UyRbeLlVU_6KKIgTth3k','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('IdL2JpULxKS3qLBTKwYZX','u8XicmKS_DxHyRKM0ebga','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('LJSMBQ4Wfon4RFixKHOzm','ghV6TCMqNZE_EsWPoUjCJ','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('7T7AIWyWW0bODpzYBe8m5','UyCjYnsr2PNDgf2y1_3q2','TOdqxAjiJWhO61YMs4KIq');
INSERT INTO "rsvps" VALUES('p3fq3RFftlC8poUDH_hEH','TF8CWD0HSXPjvBhfiBq_H','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "rsvps" VALUES('MmXn7Zb7FPRPcKm8phcLi','lqEHzM6naNa1QUtKarB_9','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "rsvps" VALUES('NE38V0VJni_gn7XsoSbcl','JPUgkpWdrUEQL2tSFurQX','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "rsvps" VALUES('e-JyTGvHSHSVwhsCqlqgw','0UyRbeLlVU_6KKIgTth3k','dhYAUZrm_UZ9ZVIt1Fc3I');
INSERT INTO "rsvps" VALUES('zNvJcW6p1mDlMRlGQHpQ_','7jn_r5fNOAoLvzybLSGvS','EYktZR73XPPhHEtfufNWC');
INSERT INTO "rsvps" VALUES('qC5dmGFB1BLQkQUgPL393','TVCqKurF5iJYaX2VQCJOq','EYktZR73XPPhHEtfufNWC');
INSERT INTO "rsvps" VALUES('MjUMQBNZKHO5uEGX5EFBw','aW3SSczqWM_rte9wglKrE','EYktZR73XPPhHEtfufNWC');
INSERT INTO "rsvps" VALUES('j4UQYqqaaXsAIPLpADsRM','7TbZvUTKrbYopR-QgFp3y','EYktZR73XPPhHEtfufNWC');
INSERT INTO "rsvps" VALUES('rlDt73OCGa6q67twCHYPQ','Qz77siaU6Au34k-MT-kEs','EYktZR73XPPhHEtfufNWC');
INSERT INTO "rsvps" VALUES('2XaRmfI4P0PPppGp20jB5','25hZDqvtt-mI3Gybn_yOr','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "rsvps" VALUES('1WGzg1ihnckKd8lA2a_WH','0UyRbeLlVU_6KKIgTth3k','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "rsvps" VALUES('czAW9_OyRJlx4ET_duEFU','ghV6TCMqNZE_EsWPoUjCJ','TqxaBp5UbN2fEbaEHW6gT');
INSERT INTO "rsvps" VALUES('UvH5igieN6_EvnzwXWv9f','TF8CWD0HSXPjvBhfiBq_H','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "rsvps" VALUES('KILHDrVkpPVVYAqGPzgwn','7jn_r5fNOAoLvzybLSGvS','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "rsvps" VALUES('XPj1g8yTfFgoESFbfoufr','7TbZvUTKrbYopR-QgFp3y','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "rsvps" VALUES('H5rwVB-E7KwBNgYr2yGad','Qz77siaU6Au34k-MT-kEs','A4MXoQcNzjViz8steJ9w3');
INSERT INTO "rsvps" VALUES('WgsrDxVPu5ZX12MuYOVck','TF8CWD0HSXPjvBhfiBq_H','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "rsvps" VALUES('cMf7UiyiIVtm8BxPEPooB','25hZDqvtt-mI3Gybn_yOr','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "rsvps" VALUES('dN3SZS4E63Z0eXqEOofgJ','IeVRrak7i_3Kt_p1b4Q-b','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "rsvps" VALUES('3MEfziKWc5xUjGrNANzRg','25hZDqvtt-mI3Gybn_yOr','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('M0ZbTQDkpoZUkAo3p2VBu','IeVRrak7i_3Kt_p1b4Q-b','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('BFnRcZynbPyGhdjRr_sni','4xJK7N6kK-HvKzjCTYzP7','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('r-5BCvrp_HyrfDzxtGyH8','7TbZvUTKrbYopR-QgFp3y','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('95XddORnnXxvtrhohm_H4','u8XicmKS_DxHyRKM0ebga','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('6POZWfpOjQKD5cWg2XJnx','Qz77siaU6Au34k-MT-kEs','fFhh4S6EWUdJtR91qLZSB');
INSERT INTO "rsvps" VALUES('tgwxRVepAuYjpwjIfWJ_M','TF8CWD0HSXPjvBhfiBq_H','iGkaKua4rLriedEAt_MZe');
INSERT INTO "rsvps" VALUES('NSRwoO-pGDYV0GmKmDQYm','IeVRrak7i_3Kt_p1b4Q-b','iGkaKua4rLriedEAt_MZe');
INSERT INTO "rsvps" VALUES('m3_ztTU-r5miclxrtPrsS','7TbZvUTKrbYopR-QgFp3y','iGkaKua4rLriedEAt_MZe');
INSERT INTO "rsvps" VALUES('ij9kLPKpVV5BFRdZeobWc','u8XicmKS_DxHyRKM0ebga','iGkaKua4rLriedEAt_MZe');
INSERT INTO "rsvps" VALUES('EU0Vml6lDsSKmxJLrQs0z','ghV6TCMqNZE_EsWPoUjCJ','iGkaKua4rLriedEAt_MZe');
INSERT INTO "rsvps" VALUES('FPWWHmtf2D8qdkiE2dUem','7jn_r5fNOAoLvzybLSGvS','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "rsvps" VALUES('dHXDzqzDFrUFwjfBZSJHr','aW3SSczqWM_rte9wglKrE','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "rsvps" VALUES('d_WAXQhspCRbOS5sGKs4H','0UyRbeLlVU_6KKIgTth3k','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "rsvps" VALUES('63-eUkBDhntnV4HToPE5J','dR--X9EH-_rfZiT4kCAh1','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "rsvps" VALUES('Bj22eSf8oqW6djDtXM-Gq','Qz77siaU6Au34k-MT-kEs','jds6LoJtOps4RVLotRc7Q');
INSERT INTO "rsvps" VALUES('R2rwysUltdfaOt1GZavcU','25hZDqvtt-mI3Gybn_yOr','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "rsvps" VALUES('CvHNQC7Nk15phFn_Q2foH','JPUgkpWdrUEQL2tSFurQX','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "rsvps" VALUES('EBHGNNV3DHpNmPzIZwFYk','IeVRrak7i_3Kt_p1b4Q-b','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "rsvps" VALUES('1h49WEIjfee-3RRhP_K6m','aW3SSczqWM_rte9wglKrE','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "rsvps" VALUES('366ZglMsMiNSNFybpoSm_','Qz77siaU6Au34k-MT-kEs','JHHtBOTwqPIYOez-GGyLp');
INSERT INTO "rsvps" VALUES('q5metgo_BIXifubc7tZp4','TF8CWD0HSXPjvBhfiBq_H','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "rsvps" VALUES('HC7oOz1XKFI6g-RMdc_XA','IeVRrak7i_3Kt_p1b4Q-b','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "rsvps" VALUES('h3QkEMndwuH_Yz_Xc-mT6','4xJK7N6kK-HvKzjCTYzP7','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "rsvps" VALUES('960MvCzMqU4GajRZAaZ--','dR--X9EH-_rfZiT4kCAh1','LKan9xhO4jTTKHoHxNxe_');
INSERT INTO "rsvps" VALUES('eYMqQgkwnrL7Eq04-EQse','TF8CWD0HSXPjvBhfiBq_H','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('WJv6c5vhYO04t41NjwWXW','7jn_r5fNOAoLvzybLSGvS','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('oRa5I7ZPzS5SPvvpmITeO','TVCqKurF5iJYaX2VQCJOq','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('N4R34jPu1qvqTM-yvjQm-','4xJK7N6kK-HvKzjCTYzP7','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('__UyjtsGf4vQul7AZchCt','8jkog8QWIvGrZQthOxeRD','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('raWwf7Q3RYIgzdzsWHjpw','ghV6TCMqNZE_EsWPoUjCJ','W2bpVPegVLtZ00YHFeBZM');
INSERT INTO "rsvps" VALUES('DGSRdeWEzVkQQQnUY_GUA','dR--X9EH-_rfZiT4kCAh1','W2bpVPegVLtZ00YHFeBZM');
CREATE TABLE "session_hosts" (
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `guest_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_hosts" VALUES('D46syHfk85g9w2hDHwyjt','b_NkXrejyGIIaZAQW6c7A');
INSERT INTO "session_hosts" VALUES('jKYmOmhgIXCz9yXr6OV9G','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "session_hosts" VALUES('TF8CWD0HSXPjvBhfiBq_H','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "session_hosts" VALUES('25hZDqvtt-mI3Gybn_yOr','VhgwSw2jmAxr8Rb53Conl');
INSERT INTO "session_hosts" VALUES('lqEHzM6naNa1QUtKarB_9','JsDO81PGk2jhFzQmo-2ud');
INSERT INTO "session_hosts" VALUES('7jn_r5fNOAoLvzybLSGvS','gHLNm3ONuzcyMnDClj73-');
INSERT INTO "session_hosts" VALUES('JPUgkpWdrUEQL2tSFurQX','iGkaKua4rLriedEAt_MZe');
INSERT INTO "session_hosts" VALUES('IeVRrak7i_3Kt_p1b4Q-b','zUSsq4NQgbap_Ra7XRDVw');
INSERT INTO "session_hosts" VALUES('TVCqKurF5iJYaX2VQCJOq','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "session_hosts" VALUES('aW3SSczqWM_rte9wglKrE','iShv18yQvprVcDvxCQmmA');
INSERT INTO "session_hosts" VALUES('4xJK7N6kK-HvKzjCTYzP7','w81mxy1iPJdxLYvE__HBk');
INSERT INTO "session_hosts" VALUES('0UyRbeLlVU_6KKIgTth3k','wuMh9z-507W06D0wglsAg');
INSERT INTO "session_hosts" VALUES('7TbZvUTKrbYopR-QgFp3y','KkSNBDEU1KRxBUbvn4mS8');
INSERT INTO "session_hosts" VALUES('u8XicmKS_DxHyRKM0ebga','DVNAWsooAkCOWvX1Sp0H1');
INSERT INTO "session_hosts" VALUES('u8XicmKS_DxHyRKM0ebga','KO07-qB9ijetC-IRL3hAK');
INSERT INTO "session_hosts" VALUES('8jkog8QWIvGrZQthOxeRD','eNsBR5nTUbqZgW0JzQYBY');
INSERT INTO "session_hosts" VALUES('ghV6TCMqNZE_EsWPoUjCJ','iAdjF-EtX27_ccwI2NVWN');
INSERT INTO "session_hosts" VALUES('uT9nu0FJ-rIu4YzOfttLw','7M832wmyr7fp7NiWF71Ux');
INSERT INTO "session_hosts" VALUES('dR--X9EH-_rfZiT4kCAh1','awxf7QqL3cb4WvzT4C7PI');
INSERT INTO "session_hosts" VALUES('2XiEUym2eyJE7437hicyP','XNmy3ygsgvUjjnni0qsxe');
INSERT INTO "session_hosts" VALUES('UyCjYnsr2PNDgf2y1_3q2','MZjJiKbO-RGkvrvSMlyHZ');
INSERT INTO "session_hosts" VALUES('Qz77siaU6Au34k-MT-kEs','iAdjF-EtX27_ccwI2NVWN');
CREATE TABLE "session_locations" (
	`session_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `location_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_locations" VALUES('D46syHfk85g9w2hDHwyjt','loc-main-hall');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-main-hall');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-room-a');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-room-b');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-library');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-boardroom');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-auditorium');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-courtyard');
INSERT INTO "session_locations" VALUES('y-jDOa_dq4pH_veGs_18j','loc-rooftop');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-main-hall');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-room-a');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-room-b');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-library');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-boardroom');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-auditorium');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-courtyard');
INSERT INTO "session_locations" VALUES('HTRss7aGMtqBAOwY3J6kG','loc-rooftop');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-main-hall');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-room-a');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-room-b');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-library');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-boardroom');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-auditorium');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-courtyard');
INSERT INTO "session_locations" VALUES('hNeSMt7a9xlsbNdYia03i','loc-rooftop');
INSERT INTO "session_locations" VALUES('jKYmOmhgIXCz9yXr6OV9G','loc-main-hall');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-main-hall');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-room-a');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-room-b');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-library');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-boardroom');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-auditorium');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-courtyard');
INSERT INTO "session_locations" VALUES('ZLh56c1B1Tp92rpx-rQVs','loc-rooftop');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-main-hall');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-room-a');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-room-b');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-library');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-boardroom');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-auditorium');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-courtyard');
INSERT INTO "session_locations" VALUES('WCZBBqybIRWcZiIhVdWsL','loc-rooftop');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-main-hall');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-room-a');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-room-b');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-library');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-boardroom');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-auditorium');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-courtyard');
INSERT INTO "session_locations" VALUES('_cgjMMUSGHmhKArgCskCH','loc-rooftop');
INSERT INTO "session_locations" VALUES('TF8CWD0HSXPjvBhfiBq_H','loc-main-hall');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-main-hall');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-room-a');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-room-b');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-library');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-boardroom');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-auditorium');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-courtyard');
INSERT INTO "session_locations" VALUES('ftudVNBLNLIGQkVzpm_bo','loc-rooftop');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-main-hall');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-room-a');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-room-b');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-library');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-boardroom');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-auditorium');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-courtyard');
INSERT INTO "session_locations" VALUES('4N_XS4vKa9htcaMUJTEnR','loc-rooftop');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-main-hall');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-room-a');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-room-b');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-library');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-boardroom');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-auditorium');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-courtyard');
INSERT INTO "session_locations" VALUES('4DDK2NtStsYtnDWfZszPv','loc-rooftop');
INSERT INTO "session_locations" VALUES('25hZDqvtt-mI3Gybn_yOr','loc-main-hall');
INSERT INTO "session_locations" VALUES('lqEHzM6naNa1QUtKarB_9','loc-room-a');
INSERT INTO "session_locations" VALUES('7jn_r5fNOAoLvzybLSGvS','loc-main-hall');
INSERT INTO "session_locations" VALUES('JPUgkpWdrUEQL2tSFurQX','loc-room-b');
INSERT INTO "session_locations" VALUES('IeVRrak7i_3Kt_p1b4Q-b','loc-room-a');
INSERT INTO "session_locations" VALUES('TVCqKurF5iJYaX2VQCJOq','loc-main-hall');
INSERT INTO "session_locations" VALUES('aW3SSczqWM_rte9wglKrE','loc-room-b');
INSERT INTO "session_locations" VALUES('4xJK7N6kK-HvKzjCTYzP7','loc-room-a');
INSERT INTO "session_locations" VALUES('0UyRbeLlVU_6KKIgTth3k','loc-main-hall');
INSERT INTO "session_locations" VALUES('0UyRbeLlVU_6KKIgTth3k','loc-auditorium');
INSERT INTO "session_locations" VALUES('7TbZvUTKrbYopR-QgFp3y','loc-room-b');
INSERT INTO "session_locations" VALUES('u8XicmKS_DxHyRKM0ebga','loc-main-hall');
INSERT INTO "session_locations" VALUES('8jkog8QWIvGrZQthOxeRD','loc-room-b');
INSERT INTO "session_locations" VALUES('ghV6TCMqNZE_EsWPoUjCJ','loc-main-hall');
INSERT INTO "session_locations" VALUES('ghV6TCMqNZE_EsWPoUjCJ','loc-auditorium');
INSERT INTO "session_locations" VALUES('uT9nu0FJ-rIu4YzOfttLw','loc-main-hall');
INSERT INTO "session_locations" VALUES('dR--X9EH-_rfZiT4kCAh1','loc-room-a');
INSERT INTO "session_locations" VALUES('2XiEUym2eyJE7437hicyP','loc-room-b');
INSERT INTO "session_locations" VALUES('UyCjYnsr2PNDgf2y1_3q2','loc-main-hall');
INSERT INTO "session_locations" VALUES('Qz77siaU6Au34k-MT-kEs','loc-main-hall');
CREATE TABLE "session_proposals" (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer,
	`created_time` text NOT NULL, `updated_time` text, `cohost_wanted` integer DEFAULT false NOT NULL, `cohost_wanted_note` text, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_proposals" VALUES('EwOlntThYK7FVlIxHCdfA','-D7eLgFNVCGXbS6sFHxT5','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',30,'2026-11-11T12:55:11.443Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('2uOcTAVwGpLkXDpHB9bTs','-D7eLgFNVCGXbS6sFHxT5','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',NULL,'2026-11-11T12:55:11.443Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('PHmbHeid0LEB0ixPuOr5g','-D7eLgFNVCGXbS6sFHxT5','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',150,'2026-11-11T12:55:11.443Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Xb3Ab1wali9mTkzExMA9d','-D7eLgFNVCGXbS6sFHxT5','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',90,'2026-11-11T12:55:11.443Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('LA0UTc5ecPCtQ4fR7t_jJ','-D7eLgFNVCGXbS6sFHxT5','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-11T12:55:11.443Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ibHZmT0nk-Kul9Q-o6a93','-D7eLgFNVCGXbS6sFHxT5','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-11T12:55:11.443Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('Qomp7T99BJTfLqyLwSesy','-D7eLgFNVCGXbS6sFHxT5','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-11T12:55:11.443Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('q5Icf3gUPdHot08mgb-oV','-D7eLgFNVCGXbS6sFHxT5','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',120,'2026-11-11T12:55:11.443Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('zr8fpgelXiwm8z3hl-rri','-D7eLgFNVCGXbS6sFHxT5','Conference Alpha Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Alpha attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Yr3zzVZ5MVCbdXroCpDyu','-D7eLgFNVCGXbS6sFHxT5','Networking & Coffee Chat: Connect with Conference Alpha Peers','An informal networking session designed to help Conference Alpha attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Z_lCfCQ3C35MQT7SEpZiA','-D7eLgFNVCGXbS6sFHxT5','Conference Alpha Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Alpha community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ANDNcmgsucqi5tcALiSY6','AycNOr2kRijxOeqMKZp6N','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-11T12:55:11.444Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('GTGowzhFye1nA4_DujHKM','AycNOr2kRijxOeqMKZp6N','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',150,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('lIDSDvobYN8lqHXvvhi6Q','AycNOr2kRijxOeqMKZp6N','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ikBBD0o87itEYsGZqvr_T','AycNOr2kRijxOeqMKZp6N','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-11T12:55:11.444Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('ZlPL37zMomL_iTbQwa31c','AycNOr2kRijxOeqMKZp6N','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',150,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('rq9oDRUSITLhePXn-2879','AycNOr2kRijxOeqMKZp6N','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-11T12:55:11.444Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('K34rDMv8gGdW75wvsjUdM','AycNOr2kRijxOeqMKZp6N','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('W4NZWnMihokeCrP4FLCMV','AycNOr2kRijxOeqMKZp6N','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('SvoO3o7XGgklngR8ek-FD','AycNOr2kRijxOeqMKZp6N','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Gw5OKqz5TOVvj0MdpuK1S','AycNOr2kRijxOeqMKZp6N','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('tozCWt2jSXx6BDU_C-Dux','AycNOr2kRijxOeqMKZp6N','Conference Beta Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Beta attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('hT53A2RlU_Mslz44CqTpr','AycNOr2kRijxOeqMKZp6N','Networking & Coffee Chat: Connect with Conference Beta Peers','An informal networking session designed to help Conference Beta attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('lX8qxH3xs1tBgjJNDlbcF','AycNOr2kRijxOeqMKZp6N','Conference Beta Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Beta community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('T0vl6IHCkCI4FtjtbcLlF','UYLjQ2vfV0lUt6zpqB92I','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-11T12:55:11.444Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('9S7_RuWFCXZqFcMGm7sUj','UYLjQ2vfV0lUt6zpqB92I','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('3jP4LS6De_73-__3qsoYC','UYLjQ2vfV0lUt6zpqB92I','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('hCo6YM0JDwS7OUeusmzRG','UYLjQ2vfV0lUt6zpqB92I','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-11T12:55:11.444Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('x9ZvfRHasYEgj2LLzeC4d','UYLjQ2vfV0lUt6zpqB92I','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('1R64rynqAya5F7kCxNKGZ','UYLjQ2vfV0lUt6zpqB92I','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',60,'2026-11-11T12:55:11.444Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('Pza1FhINB26ILPRHXsJ6U','UYLjQ2vfV0lUt6zpqB92I','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('BS_uBronCbKREa-yEEKkP','UYLjQ2vfV0lUt6zpqB92I','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('2WWSai5rKvKdVtMLauu4W','UYLjQ2vfV0lUt6zpqB92I','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('eO6NPsnTxvjPiD6g8jOa8','UYLjQ2vfV0lUt6zpqB92I','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('iA02gGEqR0ReOTj99g0nP','UYLjQ2vfV0lUt6zpqB92I','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('_x7ZJyxlvtFtOyjWSyLOh','UYLjQ2vfV0lUt6zpqB92I','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Kizq8EmvXGR-buAVPTVxb','UYLjQ2vfV0lUt6zpqB92I','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('QKz5ST--_eq7yHltpXK8-','UYLjQ2vfV0lUt6zpqB92I','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('LExhIDOlSStuRcwIiOoEe','UYLjQ2vfV0lUt6zpqB92I','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('_IfepNxpIdnAu06-zW_lA','UYLjQ2vfV0lUt6zpqB92I','Conference Gamma Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Gamma attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('31U8XRQQ8KX6X9uMUE8Tj','UYLjQ2vfV0lUt6zpqB92I','Networking & Coffee Chat: Connect with Conference Gamma Peers','An informal networking session designed to help Conference Gamma attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('miY3JUW-fRAEsE7JoRg9I','UYLjQ2vfV0lUt6zpqB92I','Conference Gamma Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Gamma community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('sFaY19y0fc_kYDeAIxphd','UYLjQ2vfV0lUt6zpqB92I','Writing Documentation People Actually Read','Most documentation is written once, in a hurry, by whoever shipped the feature. This session is about the opposite: treating docs as a product with readers, a first minute that has to land, and a maintenance cost you plan for.

We''ll look at real examples — a few good, several painfully bad — and pull out what separates them: task-shaped titles, examples before explanations, and the courage to delete a page.

Bring a page you''re unhappy with and we''ll rework it together.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Asnej6V3vXniwIcJeL-iv','UYLjQ2vfV0lUt6zpqB92I','Your First Conference Talk: From Idea to Stage','You have something worth saying and no idea how to turn it into 30 minutes on a stage. Let''s fix that.

We''ll cover finding a topic that''s genuinely yours, writing an abstract that survives a review committee, building slides that support you instead of competing with you, and what to do when your demo dies in front of 200 people (it will, eventually).

Aimed at people who have *never* spoken before. No slides of my own — we work on yours.',90,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('jzjV8N8Bhgx7BnJsWdRAa','UYLjQ2vfV0lUt6zpqB92I','Ask Me Anything: Migrating a Legacy Monolith','**Looking for someone to host this!**

Several of us are staring down the same problem: a monolith that works, pays the bills, and is slowly becoming impossible to change. We''d love to hear from somebody who has actually come out the other side of a migration — what you''d do again, and what you''d never repeat.

If you''ve lived through one, please add yourself as host. An honest hour of war stories beats a polished talk.',60,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('_TkjOr_sYiCUpd8O0U--a','UYLjQ2vfV0lUt6zpqB92I','Board Games for People Who Are Tired of Talking','By day three, everyone''s social battery is empty. This is a quiet room with a table, a stack of games, and no agenda.

Nobody has volunteered to bring the games yet — if you''re travelling with something short and easy to teach, add yourself as host and we''ll make it happen.',120,'2026-11-11T12:55:11.444Z',NULL,0,NULL,1);
CREATE TABLE "votes" (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`choice` text NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "votes" VALUES('u8vhkMHiZxpijZhoJ9JUl','ANDNcmgsucqi5tcALiSY6','b_NkXrejyGIIaZAQW6c7A','maybe');
INSERT INTO "votes" VALUES('LzHdRn9AUU28ooQxoDTRy','ikBBD0o87itEYsGZqvr_T','b_NkXrejyGIIaZAQW6c7A','interested');
INSERT INTO "votes" VALUES('pGLjI9zn7Ifs05B6caxXp','rq9oDRUSITLhePXn-2879','b_NkXrejyGIIaZAQW6c7A','maybe');
INSERT INTO "votes" VALUES('_cMYer6xJLnngJWj_XFnU','K34rDMv8gGdW75wvsjUdM','b_NkXrejyGIIaZAQW6c7A','maybe');
INSERT INTO "votes" VALUES('tLe6NXte4Uw5qODtL1ynk','SvoO3o7XGgklngR8ek-FD','b_NkXrejyGIIaZAQW6c7A','interested');
INSERT INTO "votes" VALUES('XChvzi_YqTm951CiLSit9','Gw5OKqz5TOVvj0MdpuK1S','b_NkXrejyGIIaZAQW6c7A','skip');
INSERT INTO "votes" VALUES('5sXoHeY9fxp3nBi9l6rlN','GTGowzhFye1nA4_DujHKM','DVNAWsooAkCOWvX1Sp0H1','maybe');
INSERT INTO "votes" VALUES('IG6bZFYcJQYWQ4HFIgImw','ikBBD0o87itEYsGZqvr_T','DVNAWsooAkCOWvX1Sp0H1','interested');
INSERT INTO "votes" VALUES('6ESIiG4qCjBgt8V2ElMYH','ZlPL37zMomL_iTbQwa31c','DVNAWsooAkCOWvX1Sp0H1','skip');
INSERT INTO "votes" VALUES('jGm2shRRIgkCQnZzDKWyz','SvoO3o7XGgklngR8ek-FD','DVNAWsooAkCOWvX1Sp0H1','maybe');
INSERT INTO "votes" VALUES('n5TWfD_F4WR8SzMtqAZwx','ZlPL37zMomL_iTbQwa31c','iAdjF-EtX27_ccwI2NVWN','maybe');
INSERT INTO "votes" VALUES('YeS90BMkOL4ZRWRrNRLvh','rq9oDRUSITLhePXn-2879','iAdjF-EtX27_ccwI2NVWN','maybe');
INSERT INTO "votes" VALUES('GeBmlXauUKuB01zfWRKgE','lIDSDvobYN8lqHXvvhi6Q','VhgwSw2jmAxr8Rb53Conl','maybe');
INSERT INTO "votes" VALUES('DIwuTbAYwJ9TB_uEMMoO2','ikBBD0o87itEYsGZqvr_T','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('l7GwVpnhqUkNsO4wj-A4w','K34rDMv8gGdW75wvsjUdM','VhgwSw2jmAxr8Rb53Conl','maybe');
INSERT INTO "votes" VALUES('eNJlgXomr4ClfSpvEhrCi','W4NZWnMihokeCrP4FLCMV','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('d-zf1yqVYDBOi2FXgARnR','SvoO3o7XGgklngR8ek-FD','VhgwSw2jmAxr8Rb53Conl','skip');
INSERT INTO "votes" VALUES('D4hR4ZQW44_A2tSw2-y-C','GTGowzhFye1nA4_DujHKM','Wk7lndCBEZJn1NY-SjFz0','skip');
INSERT INTO "votes" VALUES('jvinndZ5TwASbWgElA673','rq9oDRUSITLhePXn-2879','Wk7lndCBEZJn1NY-SjFz0','interested');
INSERT INTO "votes" VALUES('wR8kqpf82bu27DxGIWiDH','ANDNcmgsucqi5tcALiSY6','JsDO81PGk2jhFzQmo-2ud','maybe');
INSERT INTO "votes" VALUES('Groe8_UjPc2flmmlORaGe','K34rDMv8gGdW75wvsjUdM','JsDO81PGk2jhFzQmo-2ud','maybe');
INSERT INTO "votes" VALUES('-xSMvcr5nDttiMqaMWpMq','SvoO3o7XGgklngR8ek-FD','JsDO81PGk2jhFzQmo-2ud','skip');
INSERT INTO "votes" VALUES('5mQ26j4KNmazUh_KVzzVC','ANDNcmgsucqi5tcALiSY6','yiwyv5a_bWUh_YLq3wV7_','skip');
INSERT INTO "votes" VALUES('x5JSblfgToq5E3INTavjr','GTGowzhFye1nA4_DujHKM','yiwyv5a_bWUh_YLq3wV7_','skip');
INSERT INTO "votes" VALUES('MJyst6hAJejcVBJntEU0H','lIDSDvobYN8lqHXvvhi6Q','yiwyv5a_bWUh_YLq3wV7_','skip');
INSERT INTO "votes" VALUES('sTOwXl0yd05a5lOm8-jnn','ikBBD0o87itEYsGZqvr_T','yiwyv5a_bWUh_YLq3wV7_','maybe');
INSERT INTO "votes" VALUES('dvZ6wsJwzPyJaACsyV60f','K34rDMv8gGdW75wvsjUdM','yiwyv5a_bWUh_YLq3wV7_','maybe');
INSERT INTO "votes" VALUES('ywqjlFMQGt5WqittpwuGy','W4NZWnMihokeCrP4FLCMV','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('MK3CCd_4PUPMYq-87l1Cx','SvoO3o7XGgklngR8ek-FD','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('ezmDRBm2W5fSIlltDPKSx','Gw5OKqz5TOVvj0MdpuK1S','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('Qmwfw9MA9YDOhZYtnz0fZ','ANDNcmgsucqi5tcALiSY6','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('ck03iCt4HHqIhSRTYNns1','GTGowzhFye1nA4_DujHKM','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('oh-lR5KY1ZdsAktCxcAmt','W4NZWnMihokeCrP4FLCMV','wuMh9z-507W06D0wglsAg','maybe');
INSERT INTO "votes" VALUES('eQk5Dg91Q7lRMBMp_uqoC','Gw5OKqz5TOVvj0MdpuK1S','wuMh9z-507W06D0wglsAg','skip');
INSERT INTO "votes" VALUES('2QKEBReoojiAsNetl1MGd','lIDSDvobYN8lqHXvvhi6Q','Ocs_eOqCR0_EEXAuI55Fg','skip');
INSERT INTO "votes" VALUES('U6ACBlfcKQsBRvVI6SHbD','rq9oDRUSITLhePXn-2879','Ocs_eOqCR0_EEXAuI55Fg','maybe');
INSERT INTO "votes" VALUES('JmN___rO6EvVD0qUmNHK6','Gw5OKqz5TOVvj0MdpuK1S','Ocs_eOqCR0_EEXAuI55Fg','maybe');
INSERT INTO "votes" VALUES('1TCBExHT7ryiy9I_j0hxq','GTGowzhFye1nA4_DujHKM','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('A6tgpYChq5IXtsm3c72LC','lIDSDvobYN8lqHXvvhi6Q','MZjJiKbO-RGkvrvSMlyHZ','interested');
INSERT INTO "votes" VALUES('4jd79XLpv86GaARcMgP0z','ikBBD0o87itEYsGZqvr_T','MZjJiKbO-RGkvrvSMlyHZ','interested');
INSERT INTO "votes" VALUES('nJewcF7QEWCBDbZkbF0Fd','ZlPL37zMomL_iTbQwa31c','MZjJiKbO-RGkvrvSMlyHZ','skip');
INSERT INTO "votes" VALUES('hZY1Rs_vY8lEAKzZz9urq','Gw5OKqz5TOVvj0MdpuK1S','MZjJiKbO-RGkvrvSMlyHZ','skip');
INSERT INTO "votes" VALUES('8yyFFaCqOuJFAkD7Ho5kz','W4NZWnMihokeCrP4FLCMV','awxf7QqL3cb4WvzT4C7PI','maybe');
INSERT INTO "votes" VALUES('40AHzzo93MMNkzyppsHp2','SvoO3o7XGgklngR8ek-FD','awxf7QqL3cb4WvzT4C7PI','maybe');
INSERT INTO "votes" VALUES('Su6ITaKcprNaBp_W357PX','Gw5OKqz5TOVvj0MdpuK1S','awxf7QqL3cb4WvzT4C7PI','interested');
INSERT INTO "votes" VALUES('44JXV9O2KW_4Yq4io5aTM','ANDNcmgsucqi5tcALiSY6','p7eh7GiHs_WQ0SmyqQ2rs','skip');
INSERT INTO "votes" VALUES('89b9KwUuF_VEoIu5M8Sqo','GTGowzhFye1nA4_DujHKM','p7eh7GiHs_WQ0SmyqQ2rs','skip');
INSERT INTO "votes" VALUES('k9GoaFMlJF9dG1Oi-hU51','ikBBD0o87itEYsGZqvr_T','p7eh7GiHs_WQ0SmyqQ2rs','skip');
INSERT INTO "votes" VALUES('3Pk6bQ-Q1V2aGX5M1CYmz','ZlPL37zMomL_iTbQwa31c','p7eh7GiHs_WQ0SmyqQ2rs','interested');
INSERT INTO "votes" VALUES('aSphp4GHhfEzQwJODXM_7','rq9oDRUSITLhePXn-2879','p7eh7GiHs_WQ0SmyqQ2rs','maybe');
INSERT INTO "votes" VALUES('2ouHkpbjrjHjf40Q9iYFh','K34rDMv8gGdW75wvsjUdM','p7eh7GiHs_WQ0SmyqQ2rs','interested');
INSERT INTO "votes" VALUES('UkTD56_DtkKkEz81MSodL','lIDSDvobYN8lqHXvvhi6Q','iShv18yQvprVcDvxCQmmA','maybe');
INSERT INTO "votes" VALUES('A5c4luW6qgNaaM4_sljBz','ikBBD0o87itEYsGZqvr_T','iShv18yQvprVcDvxCQmmA','skip');
INSERT INTO "votes" VALUES('0Y4ChK9_KwuRc5Zyvkwm9','ZlPL37zMomL_iTbQwa31c','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('izs18OTbdrt7aGKyYWz0s','rq9oDRUSITLhePXn-2879','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('ggxtMt8Ac0NetQiXksZ7Y','SvoO3o7XGgklngR8ek-FD','XNmy3ygsgvUjjnni0qsxe','interested');
INSERT INTO "votes" VALUES('poZ-BmYIxTyIiakNAHP-D','GTGowzhFye1nA4_DujHKM','u_uY2Tj4Y3FV2i-A6PG9P','maybe');
INSERT INTO "votes" VALUES('-Y0ElfnDlxGN9uZDXd_MQ','ikBBD0o87itEYsGZqvr_T','u_uY2Tj4Y3FV2i-A6PG9P','interested');
INSERT INTO "votes" VALUES('wTfzABZNvOJvTEmsnJtft','rq9oDRUSITLhePXn-2879','u_uY2Tj4Y3FV2i-A6PG9P','maybe');
INSERT INTO "votes" VALUES('vIcnCWYsfzi1D-7XuzOTK','K34rDMv8gGdW75wvsjUdM','u_uY2Tj4Y3FV2i-A6PG9P','interested');
INSERT INTO "votes" VALUES('1GsU46IoJr7TDsADuPwhe','SvoO3o7XGgklngR8ek-FD','u_uY2Tj4Y3FV2i-A6PG9P','maybe');
INSERT INTO "votes" VALUES('5eccQZ_dOAPUC3wDu52Ym','Gw5OKqz5TOVvj0MdpuK1S','u_uY2Tj4Y3FV2i-A6PG9P','interested');
INSERT INTO "votes" VALUES('Mr2P-YgNltVEi0VAKt_Gx','lIDSDvobYN8lqHXvvhi6Q','w81mxy1iPJdxLYvE__HBk','skip');
INSERT INTO "votes" VALUES('xvC7d7nSxI6u3H3POpbX3','ikBBD0o87itEYsGZqvr_T','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('NZE3qoNG-0F1bCd42lHQQ','rq9oDRUSITLhePXn-2879','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('uX0xZBRp8ztpkVw39VHmk','K34rDMv8gGdW75wvsjUdM','w81mxy1iPJdxLYvE__HBk','maybe');
INSERT INTO "votes" VALUES('2Cp3vbdU5-gxEM-eGnFSA','W4NZWnMihokeCrP4FLCMV','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('vEYAbJCE7GqUuR9A0-bst','SvoO3o7XGgklngR8ek-FD','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('50tqU0rUH5u7NXENw4xnd','GTGowzhFye1nA4_DujHKM','Fd3gPLbxQVivweWTS2OYu','skip');
INSERT INTO "votes" VALUES('3T2L-2MR7pwQd82GclxUL','lIDSDvobYN8lqHXvvhi6Q','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('x0xfN84TX-8uQCAWsv6Ex','ikBBD0o87itEYsGZqvr_T','Fd3gPLbxQVivweWTS2OYu','skip');
INSERT INTO "votes" VALUES('r28S5n6-LS13u3tL858mI','K34rDMv8gGdW75wvsjUdM','Fd3gPLbxQVivweWTS2OYu','maybe');
INSERT INTO "votes" VALUES('vaIIS3I5_kfqvZ08Jg4u0','SvoO3o7XGgklngR8ek-FD','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('WdIZ9rsNemQgGpeIagAxW','Gw5OKqz5TOVvj0MdpuK1S','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('Ex9VkLgiMEen3eNHJ7Evc','ANDNcmgsucqi5tcALiSY6','nwkMQXuSCjcT2u-kd5dLs','interested');
INSERT INTO "votes" VALUES('Aa45JoDetCyPBMgcSmdRW','GTGowzhFye1nA4_DujHKM','nwkMQXuSCjcT2u-kd5dLs','interested');
INSERT INTO "votes" VALUES('-FWeGrHZSIHg57PhdzPh7','W4NZWnMihokeCrP4FLCMV','nwkMQXuSCjcT2u-kd5dLs','maybe');
INSERT INTO "votes" VALUES('Gp8dVNMgy0gGgFfDiCVQH','SvoO3o7XGgklngR8ek-FD','nwkMQXuSCjcT2u-kd5dLs','maybe');
INSERT INTO "votes" VALUES('Yhd2l8Ydi9YnqmXAI_ESP','ANDNcmgsucqi5tcALiSY6','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('bMhH8d5ekO1qiDd8wXZf8','GTGowzhFye1nA4_DujHKM','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('mvugG0plmtgh3D5B-ZGtn','lIDSDvobYN8lqHXvvhi6Q','PZ6BrVj315Vvxw_nrYyZQ','skip');
INSERT INTO "votes" VALUES('rxgDk05_U4X0gM3E6gDSJ','rq9oDRUSITLhePXn-2879','PZ6BrVj315Vvxw_nrYyZQ','maybe');
INSERT INTO "votes" VALUES('7eOCqOhEepyhK3mOHhImf','SvoO3o7XGgklngR8ek-FD','PZ6BrVj315Vvxw_nrYyZQ','skip');
INSERT INTO "votes" VALUES('pPxEMRW-sQfi6Gt1lsdOZ','Gw5OKqz5TOVvj0MdpuK1S','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('ckfpTJ-3UikMg8nKzt4Aq','ANDNcmgsucqi5tcALiSY6','7M832wmyr7fp7NiWF71Ux','maybe');
INSERT INTO "votes" VALUES('yHiI_Sr0-pbGWX-ppdTpY','rq9oDRUSITLhePXn-2879','7M832wmyr7fp7NiWF71Ux','maybe');
INSERT INTO "votes" VALUES('hIY_lqYiCsuVTjon1HiU-','K34rDMv8gGdW75wvsjUdM','7M832wmyr7fp7NiWF71Ux','interested');
INSERT INTO "votes" VALUES('6UjmR6negQv9hkYnMXsFO','W4NZWnMihokeCrP4FLCMV','7M832wmyr7fp7NiWF71Ux','interested');
INSERT INTO "votes" VALUES('tRUcxBCJDo3u2QOHSsopw','Gw5OKqz5TOVvj0MdpuK1S','7M832wmyr7fp7NiWF71Ux','interested');
INSERT INTO "votes" VALUES('5-HEhIo82a7ntOIYx3Qnj','ikBBD0o87itEYsGZqvr_T','gHLNm3ONuzcyMnDClj73-','skip');
INSERT INTO "votes" VALUES('Ynio4p1UGf9cbjCnZC7ST','ZlPL37zMomL_iTbQwa31c','gHLNm3ONuzcyMnDClj73-','interested');
INSERT INTO "votes" VALUES('xjaNDXAotg3M7pO35MLGG','K34rDMv8gGdW75wvsjUdM','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('fSq00Ij6znKjHow8mnitF','W4NZWnMihokeCrP4FLCMV','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('fGS7brqscDEtGFLNKPx1l','ANDNcmgsucqi5tcALiSY6','eNsBR5nTUbqZgW0JzQYBY','maybe');
INSERT INTO "votes" VALUES('GcDPHS0TptnqtvJWkM093','K34rDMv8gGdW75wvsjUdM','eNsBR5nTUbqZgW0JzQYBY','interested');
INSERT INTO "votes" VALUES('sFiWJfiSUX8yX727Dck0s','SvoO3o7XGgklngR8ek-FD','eNsBR5nTUbqZgW0JzQYBY','interested');
INSERT INTO "votes" VALUES('2H_iBopEThk2B3iNlgWSl','Gw5OKqz5TOVvj0MdpuK1S','eNsBR5nTUbqZgW0JzQYBY','skip');
INSERT INTO "votes" VALUES('jeEr4UN-4rDLdgIs7SzBC','ANDNcmgsucqi5tcALiSY6','KkSNBDEU1KRxBUbvn4mS8','interested');
INSERT INTO "votes" VALUES('3lXjOVICzV8ovcjfF_rf0','lIDSDvobYN8lqHXvvhi6Q','KkSNBDEU1KRxBUbvn4mS8','maybe');
INSERT INTO "votes" VALUES('3rAdS_KpLfw_Hkv9NoWEo','rq9oDRUSITLhePXn-2879','KkSNBDEU1KRxBUbvn4mS8','interested');
INSERT INTO "votes" VALUES('kYFkkPO86B1RRvD7S7DAm','Gw5OKqz5TOVvj0MdpuK1S','KkSNBDEU1KRxBUbvn4mS8','skip');
INSERT INTO "votes" VALUES('2_HYUWR6lANrw-UKDnaWe','rq9oDRUSITLhePXn-2879','CxdYNzzd9zNg8WvWozhwl','skip');
INSERT INTO "votes" VALUES('-l4LqjmuK1z9kc3u0CbS0','SvoO3o7XGgklngR8ek-FD','CxdYNzzd9zNg8WvWozhwl','interested');
INSERT INTO "votes" VALUES('1e0zWIJ6SfxB-M0Fe7pvg','Gw5OKqz5TOVvj0MdpuK1S','CxdYNzzd9zNg8WvWozhwl','maybe');
INSERT INTO "votes" VALUES('N9QpixdVZUHPjEnS_xu0R','ANDNcmgsucqi5tcALiSY6','gV5Pdbxs5O1DABEVnyb57','maybe');
INSERT INTO "votes" VALUES('Lmt4Yiz6zDVTkY63wDqMY','GTGowzhFye1nA4_DujHKM','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('sq7KyHISf8DbXx9LUe4xu','rq9oDRUSITLhePXn-2879','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('Y7GDo7UE6uh_nRZy_n6Er','K34rDMv8gGdW75wvsjUdM','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('nGEn6Znc-8pvDh1fYlQbN','W4NZWnMihokeCrP4FLCMV','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('AU-hMIwq2yHa6x7MyWfWL','SvoO3o7XGgklngR8ek-FD','gV5Pdbxs5O1DABEVnyb57','maybe');
INSERT INTO "votes" VALUES('YhqsgWWbFPhQ2fjNc0DCJ','ANDNcmgsucqi5tcALiSY6','zUSsq4NQgbap_Ra7XRDVw','maybe');
INSERT INTO "votes" VALUES('aZtxOipj2E5yWUszO1tQK','lIDSDvobYN8lqHXvvhi6Q','zUSsq4NQgbap_Ra7XRDVw','skip');
INSERT INTO "votes" VALUES('bLvj2QHHJZyEycJHIpXh4','Gw5OKqz5TOVvj0MdpuK1S','zUSsq4NQgbap_Ra7XRDVw','maybe');
INSERT INTO "votes" VALUES('PNFE9iDnMrbAXPnGd1kV8','GTGowzhFye1nA4_DujHKM','YeG2otpf2ApAtRzLip5fA','maybe');
INSERT INTO "votes" VALUES('Zf1icEBT2qxVhRl-J8V50','rq9oDRUSITLhePXn-2879','YeG2otpf2ApAtRzLip5fA','interested');
INSERT INTO "votes" VALUES('cCm9sX1zTxe7FfYtz4xCc','W4NZWnMihokeCrP4FLCMV','YeG2otpf2ApAtRzLip5fA','skip');
INSERT INTO "votes" VALUES('817AFCmuaeq3sQGyi4vs-','ANDNcmgsucqi5tcALiSY6','1eJpl348zRLcRaHJ_UOpf','interested');
INSERT INTO "votes" VALUES('nabuvsNYrcy-vSCJztFkh','ikBBD0o87itEYsGZqvr_T','1eJpl348zRLcRaHJ_UOpf','skip');
INSERT INTO "votes" VALUES('7NaHGs4Bcwy1h21blAp8M','K34rDMv8gGdW75wvsjUdM','1eJpl348zRLcRaHJ_UOpf','interested');
INSERT INTO "votes" VALUES('3dk3jDcB1z2KDWsxbHGrm','ANDNcmgsucqi5tcALiSY6','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('u6NKBc-hsN-zy9KvlFCYA','lIDSDvobYN8lqHXvvhi6Q','TOdqxAjiJWhO61YMs4KIq','interested');
INSERT INTO "votes" VALUES('jjmQTolZl1lCyvH8z8sqK','W4NZWnMihokeCrP4FLCMV','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('BQHppReZru4X8bnhOTK9P','SvoO3o7XGgklngR8ek-FD','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('UpYJEqgrBvqmqeMUTU2A8','Gw5OKqz5TOVvj0MdpuK1S','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('WK0kdu1434-o15L3C6Uya','ANDNcmgsucqi5tcALiSY6','dhYAUZrm_UZ9ZVIt1Fc3I','maybe');
INSERT INTO "votes" VALUES('T5C6brA15fmGhiJcVemML','lIDSDvobYN8lqHXvvhi6Q','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('s_OTDaarxTIOlQojcY0q9','K34rDMv8gGdW75wvsjUdM','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('8t6ViFebDoeeFbQa1zOCN','ANDNcmgsucqi5tcALiSY6','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('OarRcn8BQr-OmphMDKzxI','lIDSDvobYN8lqHXvvhi6Q','EYktZR73XPPhHEtfufNWC','maybe');
INSERT INTO "votes" VALUES('MFlhHxC9ju8HoshOKv1Ss','ikBBD0o87itEYsGZqvr_T','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('x9eoKExWKJrmjwH0LSzTK','rq9oDRUSITLhePXn-2879','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('0p-l19zY1iZ1plwY9zBB7','ANDNcmgsucqi5tcALiSY6','TqxaBp5UbN2fEbaEHW6gT','interested');
INSERT INTO "votes" VALUES('b1HdRuc7UYbY0QiYbFuJp','K34rDMv8gGdW75wvsjUdM','TqxaBp5UbN2fEbaEHW6gT','maybe');
INSERT INTO "votes" VALUES('aY_GRa8kjfhsoXUlMg7ev','Gw5OKqz5TOVvj0MdpuK1S','TqxaBp5UbN2fEbaEHW6gT','maybe');
INSERT INTO "votes" VALUES('Y3V3ylSUZjDagEI0nFISU','ANDNcmgsucqi5tcALiSY6','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('avVKKQlL6BKY5-5fTFFQt','GTGowzhFye1nA4_DujHKM','A4MXoQcNzjViz8steJ9w3','skip');
INSERT INTO "votes" VALUES('z6BrvMetpQtOAyMCRcZFu','ZlPL37zMomL_iTbQwa31c','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('omlKrNHdD379MYHKwtwDq','rq9oDRUSITLhePXn-2879','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('CEo7KPBswxCRUulbwtgt4','W4NZWnMihokeCrP4FLCMV','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('fv4ejLGhH10nw3HIxHuh-','SvoO3o7XGgklngR8ek-FD','A4MXoQcNzjViz8steJ9w3','maybe');
INSERT INTO "votes" VALUES('drEEWpTmJp-sQf655E4QS','ZlPL37zMomL_iTbQwa31c','KO07-qB9ijetC-IRL3hAK','interested');
INSERT INTO "votes" VALUES('3TfI5zb3Tampy9tuztx3J','ANDNcmgsucqi5tcALiSY6','fFhh4S6EWUdJtR91qLZSB','skip');
INSERT INTO "votes" VALUES('NIM_Ku_4rnjzXj07Ie42x','GTGowzhFye1nA4_DujHKM','fFhh4S6EWUdJtR91qLZSB','interested');
INSERT INTO "votes" VALUES('zkqZiNlPhJMrz-dxm4TMO','W4NZWnMihokeCrP4FLCMV','fFhh4S6EWUdJtR91qLZSB','skip');
INSERT INTO "votes" VALUES('AAYu6jg_F9pL-KOnhOfHz','SvoO3o7XGgklngR8ek-FD','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('OO4DdBzKUucS6zHXg-olB','rq9oDRUSITLhePXn-2879','iGkaKua4rLriedEAt_MZe','interested');
INSERT INTO "votes" VALUES('NdUIs-ghzdR4NxgWLyvcv','W4NZWnMihokeCrP4FLCMV','iGkaKua4rLriedEAt_MZe','interested');
INSERT INTO "votes" VALUES('T2bKhMvzyw2yhESuIPmVS','ANDNcmgsucqi5tcALiSY6','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('BqQg2lpEMguySAiS4LRdC','ikBBD0o87itEYsGZqvr_T','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('W9oT2MGJOKYjqAY2SkX42','ZlPL37zMomL_iTbQwa31c','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('-BMBG7GfrHAHCsqeawL81','rq9oDRUSITLhePXn-2879','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('_i8jqDTHrL9-jSlvX0Huz','W4NZWnMihokeCrP4FLCMV','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('uP4h5GR9jqVEwBwQO2VEl','SvoO3o7XGgklngR8ek-FD','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('_XJI8tdXCzUrUUniqoouE','ikBBD0o87itEYsGZqvr_T','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('r3h2pBHLrDiEGXX9lLIQ-','K34rDMv8gGdW75wvsjUdM','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('Q8UhWic7IsTMhBgV0XmLr','lIDSDvobYN8lqHXvvhi6Q','LKan9xhO4jTTKHoHxNxe_','maybe');
INSERT INTO "votes" VALUES('NLpyxtSUaA9pmVExef6Xt','ikBBD0o87itEYsGZqvr_T','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('YRSsmifQc_-mLrwmpxUKv','ZlPL37zMomL_iTbQwa31c','LKan9xhO4jTTKHoHxNxe_','maybe');
INSERT INTO "votes" VALUES('oazehdMnnT8CEsuCwCkHd','Gw5OKqz5TOVvj0MdpuK1S','LKan9xhO4jTTKHoHxNxe_','skip');
INSERT INTO "votes" VALUES('VTwFNbLkvX2Ch9wPnPR7X','ANDNcmgsucqi5tcALiSY6','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('FaLD7mL5Ju_yhC7N4KkD3','GTGowzhFye1nA4_DujHKM','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('ACXsuYznw7FeU9pmx6mR7','lIDSDvobYN8lqHXvvhi6Q','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('raxJhjjYxSf6oQIvKfDEy','ZlPL37zMomL_iTbQwa31c','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('sleDqocuErMx7VjjRXbi8','rq9oDRUSITLhePXn-2879','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('z50KJcNqvrG7x_g-ElM9e','W4NZWnMihokeCrP4FLCMV','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('FpApvlGh7qEER3pjJPQSX','Gw5OKqz5TOVvj0MdpuK1S','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('dri5RSnk2V4tvq1hAkE33','9S7_RuWFCXZqFcMGm7sUj','b_NkXrejyGIIaZAQW6c7A','maybe');
INSERT INTO "votes" VALUES('UdSLg0_TKCB9VtIhmj8t2','3jP4LS6De_73-__3qsoYC','b_NkXrejyGIIaZAQW6c7A','skip');
INSERT INTO "votes" VALUES('K-QMEQnJnUvTNWN6QXpu0','1R64rynqAya5F7kCxNKGZ','b_NkXrejyGIIaZAQW6c7A','skip');
INSERT INTO "votes" VALUES('WLCL-HvnaalSEJL6NC3x5','2WWSai5rKvKdVtMLauu4W','b_NkXrejyGIIaZAQW6c7A','maybe');
INSERT INTO "votes" VALUES('OKb55UK5kOYmtnB9x4cSU','iA02gGEqR0ReOTj99g0nP','b_NkXrejyGIIaZAQW6c7A','skip');
INSERT INTO "votes" VALUES('sIYx-E4jITjkp8duQ1KSn','QKz5ST--_eq7yHltpXK8-','b_NkXrejyGIIaZAQW6c7A','interested');
INSERT INTO "votes" VALUES('T5lDYWdgWLLZYCLfm35G9','sFaY19y0fc_kYDeAIxphd','b_NkXrejyGIIaZAQW6c7A','interested');
INSERT INTO "votes" VALUES('W-x_9UUZBsQ2g0ky9ji84','_TkjOr_sYiCUpd8O0U--a','b_NkXrejyGIIaZAQW6c7A','skip');
INSERT INTO "votes" VALUES('HRe3h_ZVA4-GBKBC8h-no','9S7_RuWFCXZqFcMGm7sUj','DVNAWsooAkCOWvX1Sp0H1','skip');
INSERT INTO "votes" VALUES('dz4rOwGnfgyhN2wDAIXpl','x9ZvfRHasYEgj2LLzeC4d','DVNAWsooAkCOWvX1Sp0H1','skip');
INSERT INTO "votes" VALUES('akEycMdcZIJgOH8zT3q6d','1R64rynqAya5F7kCxNKGZ','DVNAWsooAkCOWvX1Sp0H1','skip');
INSERT INTO "votes" VALUES('V0hLQQhsdJFlZQZclYMgT','2WWSai5rKvKdVtMLauu4W','DVNAWsooAkCOWvX1Sp0H1','interested');
INSERT INTO "votes" VALUES('iClQLlaS7ZWS_dIk3hhjQ','QKz5ST--_eq7yHltpXK8-','DVNAWsooAkCOWvX1Sp0H1','skip');
INSERT INTO "votes" VALUES('r-mlaFvOrw8qpdCDSoVoH','Asnej6V3vXniwIcJeL-iv','DVNAWsooAkCOWvX1Sp0H1','maybe');
INSERT INTO "votes" VALUES('GxghtqxDVQmANoIMZpuF5','hCo6YM0JDwS7OUeusmzRG','iAdjF-EtX27_ccwI2NVWN','maybe');
INSERT INTO "votes" VALUES('DHW6YUg05nw_KwtK9DQYm','1R64rynqAya5F7kCxNKGZ','iAdjF-EtX27_ccwI2NVWN','interested');
INSERT INTO "votes" VALUES('rgj-ezXNbtAMvCc-0xl5i','BS_uBronCbKREa-yEEKkP','iAdjF-EtX27_ccwI2NVWN','interested');
INSERT INTO "votes" VALUES('rQ5oKy7sTrptwzm4IOsYn','eO6NPsnTxvjPiD6g8jOa8','iAdjF-EtX27_ccwI2NVWN','skip');
INSERT INTO "votes" VALUES('c8nP2l4GCJ0GdHANEfv4R','_x7ZJyxlvtFtOyjWSyLOh','iAdjF-EtX27_ccwI2NVWN','maybe');
INSERT INTO "votes" VALUES('rOPApgHDiVNqKdQambkcU','Kizq8EmvXGR-buAVPTVxb','iAdjF-EtX27_ccwI2NVWN','skip');
INSERT INTO "votes" VALUES('YyrkF73tFRQkCj3MZKwkt','sFaY19y0fc_kYDeAIxphd','iAdjF-EtX27_ccwI2NVWN','skip');
INSERT INTO "votes" VALUES('JUZ2SIaCiT-feNKkDQX_E','_TkjOr_sYiCUpd8O0U--a','iAdjF-EtX27_ccwI2NVWN','skip');
INSERT INTO "votes" VALUES('0-uQoG6x3c1YfHaHvQCyF','T0vl6IHCkCI4FtjtbcLlF','VhgwSw2jmAxr8Rb53Conl','skip');
INSERT INTO "votes" VALUES('GFI6YyKFVfbbK6dlwN8ij','3jP4LS6De_73-__3qsoYC','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('Kya1Vvapz2FFUtJQ1mSaF','x9ZvfRHasYEgj2LLzeC4d','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('5QHvcgrTgLTXr01QwXnGh','1R64rynqAya5F7kCxNKGZ','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('g4R_YhLRw9pyOl5fOw5z_','BS_uBronCbKREa-yEEKkP','VhgwSw2jmAxr8Rb53Conl','maybe');
INSERT INTO "votes" VALUES('s88t-1lPuXwUV24Tf7g7M','iA02gGEqR0ReOTj99g0nP','VhgwSw2jmAxr8Rb53Conl','maybe');
INSERT INTO "votes" VALUES('80ZHK0seGQ_CO_PBOX3we','_x7ZJyxlvtFtOyjWSyLOh','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('hG7i0L1t4xd-Ab2dO-yBx','sFaY19y0fc_kYDeAIxphd','VhgwSw2jmAxr8Rb53Conl','maybe');
INSERT INTO "votes" VALUES('pIWS_3zOwSHdQnFkgXxv9','_TkjOr_sYiCUpd8O0U--a','VhgwSw2jmAxr8Rb53Conl','interested');
INSERT INTO "votes" VALUES('hKq9j0f9C4s1fNK9YUJ8b','3jP4LS6De_73-__3qsoYC','Wk7lndCBEZJn1NY-SjFz0','maybe');
INSERT INTO "votes" VALUES('63ClrLdjgOuI4o1YV6FWj','x9ZvfRHasYEgj2LLzeC4d','Wk7lndCBEZJn1NY-SjFz0','maybe');
INSERT INTO "votes" VALUES('z_a_2N2nuX_IVUPa2ThZp','iA02gGEqR0ReOTj99g0nP','Wk7lndCBEZJn1NY-SjFz0','interested');
INSERT INTO "votes" VALUES('vmuWpDOwr234j9Woik10K','Asnej6V3vXniwIcJeL-iv','Wk7lndCBEZJn1NY-SjFz0','interested');
INSERT INTO "votes" VALUES('Nw-NaVrpdMbAd5jnuTJpV','jzjV8N8Bhgx7BnJsWdRAa','Wk7lndCBEZJn1NY-SjFz0','interested');
INSERT INTO "votes" VALUES('4EyO4yiV3UiT4IcHDZU7i','1R64rynqAya5F7kCxNKGZ','JsDO81PGk2jhFzQmo-2ud','interested');
INSERT INTO "votes" VALUES('ySy5BnB4CtsScxf1pbdt7','BS_uBronCbKREa-yEEKkP','JsDO81PGk2jhFzQmo-2ud','maybe');
INSERT INTO "votes" VALUES('jC5IjmXtqjKE_FDYqoFP2','2WWSai5rKvKdVtMLauu4W','JsDO81PGk2jhFzQmo-2ud','skip');
INSERT INTO "votes" VALUES('5JD8-ZIZBY2Kdn8wGPqRn','eO6NPsnTxvjPiD6g8jOa8','JsDO81PGk2jhFzQmo-2ud','interested');
INSERT INTO "votes" VALUES('I_y7KxzJveGJCLg42rJAc','iA02gGEqR0ReOTj99g0nP','JsDO81PGk2jhFzQmo-2ud','skip');
INSERT INTO "votes" VALUES('qaENGelyUvHCCxemJ62_r','Asnej6V3vXniwIcJeL-iv','JsDO81PGk2jhFzQmo-2ud','maybe');
INSERT INTO "votes" VALUES('ffXb3Xpo3U11a5iLAD29J','jzjV8N8Bhgx7BnJsWdRAa','JsDO81PGk2jhFzQmo-2ud','maybe');
INSERT INTO "votes" VALUES('yTXVPgqwU-2WTl5BM8nz6','3jP4LS6De_73-__3qsoYC','yiwyv5a_bWUh_YLq3wV7_','skip');
INSERT INTO "votes" VALUES('98P97eGnxbr4ds0EXWiQh','hCo6YM0JDwS7OUeusmzRG','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('3hhxhJbBYR3QvWasv7X5P','1R64rynqAya5F7kCxNKGZ','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('piUDmaGk4u0Km-18zH4oF','Pza1FhINB26ILPRHXsJ6U','yiwyv5a_bWUh_YLq3wV7_','maybe');
INSERT INTO "votes" VALUES('AwpRJM0Kh-6tc3aKxtUS4','iA02gGEqR0ReOTj99g0nP','yiwyv5a_bWUh_YLq3wV7_','maybe');
INSERT INTO "votes" VALUES('t8mZ4omNoq9T__vmtPwFZ','Kizq8EmvXGR-buAVPTVxb','yiwyv5a_bWUh_YLq3wV7_','interested');
INSERT INTO "votes" VALUES('Rx95ZUaZYdAPnjkR2BpqX','_TkjOr_sYiCUpd8O0U--a','yiwyv5a_bWUh_YLq3wV7_','maybe');
INSERT INTO "votes" VALUES('Ks-98739-drs3iqg3cANu','3jP4LS6De_73-__3qsoYC','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('OgUwoVd2NBiUqdwbQJL5u','hCo6YM0JDwS7OUeusmzRG','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('u8fKtiVY8GR2qF1oLvwDS','x9ZvfRHasYEgj2LLzeC4d','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('JMNnlduqXvcb9a6wUlsU8','1R64rynqAya5F7kCxNKGZ','wuMh9z-507W06D0wglsAg','maybe');
INSERT INTO "votes" VALUES('IXae9rL0WwwKcMzvkQc4_','BS_uBronCbKREa-yEEKkP','wuMh9z-507W06D0wglsAg','skip');
INSERT INTO "votes" VALUES('gu9Yl8crtIjzMgrDa4J0G','iA02gGEqR0ReOTj99g0nP','wuMh9z-507W06D0wglsAg','interested');
INSERT INTO "votes" VALUES('7_r2cUG3U9VIjV_sg8MHW','Kizq8EmvXGR-buAVPTVxb','wuMh9z-507W06D0wglsAg','maybe');
INSERT INTO "votes" VALUES('Fh15Bjl5GHdSzcpMgvTBi','sFaY19y0fc_kYDeAIxphd','wuMh9z-507W06D0wglsAg','maybe');
INSERT INTO "votes" VALUES('INR5OGqUOdOfnwA7X4gI-','jzjV8N8Bhgx7BnJsWdRAa','wuMh9z-507W06D0wglsAg','maybe');
INSERT INTO "votes" VALUES('-y3R0Em7QcUlD6TBYKHtn','Pza1FhINB26ILPRHXsJ6U','Ocs_eOqCR0_EEXAuI55Fg','skip');
INSERT INTO "votes" VALUES('Fnjm-5asdSEg0q76D_a7X','BS_uBronCbKREa-yEEKkP','Ocs_eOqCR0_EEXAuI55Fg','maybe');
INSERT INTO "votes" VALUES('Gu4x_T0LdETPN7djJYIU_','2WWSai5rKvKdVtMLauu4W','Ocs_eOqCR0_EEXAuI55Fg','interested');
INSERT INTO "votes" VALUES('nOHtm3lOjx6ILUHymMHqF','eO6NPsnTxvjPiD6g8jOa8','Ocs_eOqCR0_EEXAuI55Fg','interested');
INSERT INTO "votes" VALUES('PgU0n704y6r1MOJGgYsM-','iA02gGEqR0ReOTj99g0nP','Ocs_eOqCR0_EEXAuI55Fg','interested');
INSERT INTO "votes" VALUES('-xIEtAVmdirSwekMeSlzT','_x7ZJyxlvtFtOyjWSyLOh','Ocs_eOqCR0_EEXAuI55Fg','interested');
INSERT INTO "votes" VALUES('XUYjlfvaEHciUztOxrxPT','LExhIDOlSStuRcwIiOoEe','Ocs_eOqCR0_EEXAuI55Fg','maybe');
INSERT INTO "votes" VALUES('7GAlBMmcxNEhDQqAUmYNt','Asnej6V3vXniwIcJeL-iv','Ocs_eOqCR0_EEXAuI55Fg','maybe');
INSERT INTO "votes" VALUES('BcYUMjebnGDCbTxdo7Pfj','_TkjOr_sYiCUpd8O0U--a','Ocs_eOqCR0_EEXAuI55Fg','interested');
INSERT INTO "votes" VALUES('iLEO_loeajR5ZCLiBjarn','T0vl6IHCkCI4FtjtbcLlF','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('3kBrEV5pkYgPOFasUuagy','9S7_RuWFCXZqFcMGm7sUj','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('77vODIbQSGVVctgm-TA7e','3jP4LS6De_73-__3qsoYC','MZjJiKbO-RGkvrvSMlyHZ','interested');
INSERT INTO "votes" VALUES('Dr8hTH0BIXVxI_QzCBTda','1R64rynqAya5F7kCxNKGZ','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('r-kdyd6ChUVisCMYOnhef','eO6NPsnTxvjPiD6g8jOa8','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('FngQFTtKLcVRlDXUgsL9U','Asnej6V3vXniwIcJeL-iv','MZjJiKbO-RGkvrvSMlyHZ','maybe');
INSERT INTO "votes" VALUES('U9GW6hGeysd7bTTLBBa__','x9ZvfRHasYEgj2LLzeC4d','awxf7QqL3cb4WvzT4C7PI','maybe');
INSERT INTO "votes" VALUES('iZu0QOgeSuZyHBqVQZNVN','Pza1FhINB26ILPRHXsJ6U','awxf7QqL3cb4WvzT4C7PI','maybe');
INSERT INTO "votes" VALUES('Y-v_IrVw_dIzwYqFf5mZm','2WWSai5rKvKdVtMLauu4W','awxf7QqL3cb4WvzT4C7PI','skip');
INSERT INTO "votes" VALUES('XfscLIE4v5rJO_uRyM8ZI','_x7ZJyxlvtFtOyjWSyLOh','awxf7QqL3cb4WvzT4C7PI','interested');
INSERT INTO "votes" VALUES('-W-PuUgU5Xnbvl3xpAyf-','Kizq8EmvXGR-buAVPTVxb','awxf7QqL3cb4WvzT4C7PI','interested');
INSERT INTO "votes" VALUES('sWJHBgEZAReT9rARJEexr','QKz5ST--_eq7yHltpXK8-','awxf7QqL3cb4WvzT4C7PI','skip');
INSERT INTO "votes" VALUES('QuIs2bxOFdM4SkoDlBfIW','LExhIDOlSStuRcwIiOoEe','awxf7QqL3cb4WvzT4C7PI','skip');
INSERT INTO "votes" VALUES('qDkncChD3Gekpciqvsli3','Asnej6V3vXniwIcJeL-iv','awxf7QqL3cb4WvzT4C7PI','interested');
INSERT INTO "votes" VALUES('ngEs1ZWha5tjERXEFWp9E','jzjV8N8Bhgx7BnJsWdRAa','awxf7QqL3cb4WvzT4C7PI','interested');
INSERT INTO "votes" VALUES('VizJN83UcGf5iuV_iqPF1','3jP4LS6De_73-__3qsoYC','p7eh7GiHs_WQ0SmyqQ2rs','interested');
INSERT INTO "votes" VALUES('52DwCNJsRHdVLaMwBSV_i','QKz5ST--_eq7yHltpXK8-','p7eh7GiHs_WQ0SmyqQ2rs','maybe');
INSERT INTO "votes" VALUES('cRdp1BORrafJgtjRUxa0Y','_TkjOr_sYiCUpd8O0U--a','p7eh7GiHs_WQ0SmyqQ2rs','skip');
INSERT INTO "votes" VALUES('K5Zv_W1ujVI7aKvmxIk7d','x9ZvfRHasYEgj2LLzeC4d','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('bwMAl-gr8POZw371l76Qs','1R64rynqAya5F7kCxNKGZ','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('xmAj1UbO1xEgKm40zJVbZ','BS_uBronCbKREa-yEEKkP','iShv18yQvprVcDvxCQmmA','maybe');
INSERT INTO "votes" VALUES('1uG0VHD-mU5gqewqp4XkS','Kizq8EmvXGR-buAVPTVxb','iShv18yQvprVcDvxCQmmA','maybe');
INSERT INTO "votes" VALUES('6LLMv9736oQEklz-f-Vgf','LExhIDOlSStuRcwIiOoEe','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('eiewzDuMI_QKJ52SUWk1W','sFaY19y0fc_kYDeAIxphd','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('7X0ImL5ZQSrKzbdLhQQqi','jzjV8N8Bhgx7BnJsWdRAa','iShv18yQvprVcDvxCQmmA','skip');
INSERT INTO "votes" VALUES('GNRSQ4UsmZep23rgv-Hlk','_TkjOr_sYiCUpd8O0U--a','iShv18yQvprVcDvxCQmmA','interested');
INSERT INTO "votes" VALUES('z9QHhDD1AmO1L2rmRC9pF','T0vl6IHCkCI4FtjtbcLlF','XNmy3ygsgvUjjnni0qsxe','interested');
INSERT INTO "votes" VALUES('Ght8sHfWfOL95PkyFPv69','9S7_RuWFCXZqFcMGm7sUj','XNmy3ygsgvUjjnni0qsxe','skip');
INSERT INTO "votes" VALUES('d5H889HdeNhC0vH8irJCf','1R64rynqAya5F7kCxNKGZ','XNmy3ygsgvUjjnni0qsxe','skip');
INSERT INTO "votes" VALUES('_9T09QijiUWLDNrvxyxx0','Pza1FhINB26ILPRHXsJ6U','XNmy3ygsgvUjjnni0qsxe','maybe');
INSERT INTO "votes" VALUES('PukKXlNneehV2vljXBD54','_x7ZJyxlvtFtOyjWSyLOh','XNmy3ygsgvUjjnni0qsxe','maybe');
INSERT INTO "votes" VALUES('wu1yB_oNntPbKx1q8HE-d','LExhIDOlSStuRcwIiOoEe','XNmy3ygsgvUjjnni0qsxe','interested');
INSERT INTO "votes" VALUES('ILeZo10F6W0HK5AXz0_iO','sFaY19y0fc_kYDeAIxphd','XNmy3ygsgvUjjnni0qsxe','maybe');
INSERT INTO "votes" VALUES('HxEqd58F1BkWYiDGyTMqH','Asnej6V3vXniwIcJeL-iv','XNmy3ygsgvUjjnni0qsxe','maybe');
INSERT INTO "votes" VALUES('MG03_FfqF8ePcjtjnrkX2','jzjV8N8Bhgx7BnJsWdRAa','XNmy3ygsgvUjjnni0qsxe','skip');
INSERT INTO "votes" VALUES('2kNRK7lt7x-3kLBnLZc2y','_TkjOr_sYiCUpd8O0U--a','XNmy3ygsgvUjjnni0qsxe','maybe');
INSERT INTO "votes" VALUES('QysjyUooguEF4VP96ijOf','x9ZvfRHasYEgj2LLzeC4d','u_uY2Tj4Y3FV2i-A6PG9P','skip');
INSERT INTO "votes" VALUES('-Xl1273eobzm1uKg2y_1D','Pza1FhINB26ILPRHXsJ6U','u_uY2Tj4Y3FV2i-A6PG9P','maybe');
INSERT INTO "votes" VALUES('J_V63FJkfj88e3gh-DrDD','eO6NPsnTxvjPiD6g8jOa8','u_uY2Tj4Y3FV2i-A6PG9P','skip');
INSERT INTO "votes" VALUES('MbhtnCkWjWMvutSacqmtz','iA02gGEqR0ReOTj99g0nP','u_uY2Tj4Y3FV2i-A6PG9P','skip');
INSERT INTO "votes" VALUES('MadJluzgwRLpqyQCaE9_j','QKz5ST--_eq7yHltpXK8-','u_uY2Tj4Y3FV2i-A6PG9P','interested');
INSERT INTO "votes" VALUES('SfwlJyXLXRWNbJ6_kkUmz','LExhIDOlSStuRcwIiOoEe','u_uY2Tj4Y3FV2i-A6PG9P','interested');
INSERT INTO "votes" VALUES('sBeBZDRgeTRDaWD3efYHE','jzjV8N8Bhgx7BnJsWdRAa','u_uY2Tj4Y3FV2i-A6PG9P','skip');
INSERT INTO "votes" VALUES('EAzE8nYDsEUsQ6VGObz98','hCo6YM0JDwS7OUeusmzRG','w81mxy1iPJdxLYvE__HBk','maybe');
INSERT INTO "votes" VALUES('HeVAtvYOKrBlB3GtymuRH','x9ZvfRHasYEgj2LLzeC4d','w81mxy1iPJdxLYvE__HBk','maybe');
INSERT INTO "votes" VALUES('OnPgEEGZG2qJfIHm5Py5t','1R64rynqAya5F7kCxNKGZ','w81mxy1iPJdxLYvE__HBk','skip');
INSERT INTO "votes" VALUES('sTOfN1jytbcyXqHhYi3rk','2WWSai5rKvKdVtMLauu4W','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('XONuyC6gPUVJuAkDBymwH','eO6NPsnTxvjPiD6g8jOa8','w81mxy1iPJdxLYvE__HBk','interested');
INSERT INTO "votes" VALUES('axSY2XDrMR_goH1vE2wMl','Asnej6V3vXniwIcJeL-iv','w81mxy1iPJdxLYvE__HBk','maybe');
INSERT INTO "votes" VALUES('AP6DLDhaicko0Q7RyJRM4','BS_uBronCbKREa-yEEKkP','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('Vzfl6mjZUwU5lOX8JlxVi','2WWSai5rKvKdVtMLauu4W','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('B5bebjmJBBSigDufPvHsx','Kizq8EmvXGR-buAVPTVxb','Fd3gPLbxQVivweWTS2OYu','maybe');
INSERT INTO "votes" VALUES('tZw5uZ0ZRmZ9PHEc4zQyk','Asnej6V3vXniwIcJeL-iv','Fd3gPLbxQVivweWTS2OYu','interested');
INSERT INTO "votes" VALUES('rWCklHsg0rfBdni_WYC4x','2WWSai5rKvKdVtMLauu4W','nwkMQXuSCjcT2u-kd5dLs','maybe');
INSERT INTO "votes" VALUES('zLk38zgJ14fZ5uqH8s9c-','eO6NPsnTxvjPiD6g8jOa8','nwkMQXuSCjcT2u-kd5dLs','interested');
INSERT INTO "votes" VALUES('JInrO0mHd0weI4M_Hq13s','Kizq8EmvXGR-buAVPTVxb','nwkMQXuSCjcT2u-kd5dLs','interested');
INSERT INTO "votes" VALUES('L6uyh4cVJfyNvj9Oj_FwS','QKz5ST--_eq7yHltpXK8-','nwkMQXuSCjcT2u-kd5dLs','skip');
INSERT INTO "votes" VALUES('8hzpxWj-nhkmodUAUc3QR','LExhIDOlSStuRcwIiOoEe','nwkMQXuSCjcT2u-kd5dLs','skip');
INSERT INTO "votes" VALUES('r3mw3naGWJ0hHc0oQpt7O','9S7_RuWFCXZqFcMGm7sUj','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('7Mhzii6_Zq27Bxsk91FpN','x9ZvfRHasYEgj2LLzeC4d','PZ6BrVj315Vvxw_nrYyZQ','maybe');
INSERT INTO "votes" VALUES('TwO9YZ_G-Ok27s4dOyWKG','1R64rynqAya5F7kCxNKGZ','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('DwikAezljMKi3Ib7dw48i','QKz5ST--_eq7yHltpXK8-','PZ6BrVj315Vvxw_nrYyZQ','interested');
INSERT INTO "votes" VALUES('ki8KJjYzhtiQU6TqRI5G8','sFaY19y0fc_kYDeAIxphd','PZ6BrVj315Vvxw_nrYyZQ','skip');
INSERT INTO "votes" VALUES('qIcchqP9HlP6fOzuJFlSA','T0vl6IHCkCI4FtjtbcLlF','7M832wmyr7fp7NiWF71Ux','skip');
INSERT INTO "votes" VALUES('51y50WMLPulpCetrp_3Hk','9S7_RuWFCXZqFcMGm7sUj','7M832wmyr7fp7NiWF71Ux','maybe');
INSERT INTO "votes" VALUES('qOuIukOZd_t5I3IjYHQWP','Pza1FhINB26ILPRHXsJ6U','7M832wmyr7fp7NiWF71Ux','skip');
INSERT INTO "votes" VALUES('VuUFejyIVeupCWNlwwUNI','2WWSai5rKvKdVtMLauu4W','7M832wmyr7fp7NiWF71Ux','interested');
INSERT INTO "votes" VALUES('WT0bRmx1CJ7PDMlel8Roa','Kizq8EmvXGR-buAVPTVxb','7M832wmyr7fp7NiWF71Ux','skip');
INSERT INTO "votes" VALUES('4olyesPl0I8h-e8HkLb_w','LExhIDOlSStuRcwIiOoEe','7M832wmyr7fp7NiWF71Ux','skip');
INSERT INTO "votes" VALUES('YO6cr1vmagLJPlIKdBYVt','_TkjOr_sYiCUpd8O0U--a','7M832wmyr7fp7NiWF71Ux','maybe');
INSERT INTO "votes" VALUES('vCQ4LFbQWHj4Zhd-jVGsw','9S7_RuWFCXZqFcMGm7sUj','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('lv8kYTyFsE1pRYgZft4b3','3jP4LS6De_73-__3qsoYC','gHLNm3ONuzcyMnDClj73-','interested');
INSERT INTO "votes" VALUES('IAUTc1e4SLvCw8A-ynudd','eO6NPsnTxvjPiD6g8jOa8','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('wC1zd7idL7qIdoy0Iqtdx','iA02gGEqR0ReOTj99g0nP','gHLNm3ONuzcyMnDClj73-','interested');
INSERT INTO "votes" VALUES('nih9ZkXYDTEdCDJzbKIlP','_x7ZJyxlvtFtOyjWSyLOh','gHLNm3ONuzcyMnDClj73-','skip');
INSERT INTO "votes" VALUES('Nl3X0BYbJuxlILxt5WPKt','Asnej6V3vXniwIcJeL-iv','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('qxYQPnBtYUbFH8F-mvHQx','jzjV8N8Bhgx7BnJsWdRAa','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('Y8BZcfaoCLcXhxWEiTy2x','_TkjOr_sYiCUpd8O0U--a','gHLNm3ONuzcyMnDClj73-','maybe');
INSERT INTO "votes" VALUES('F58xxNpNIeq4ES1-fffGX','T0vl6IHCkCI4FtjtbcLlF','eNsBR5nTUbqZgW0JzQYBY','skip');
INSERT INTO "votes" VALUES('Z-h99SeoZjQ63TGSloav5','9S7_RuWFCXZqFcMGm7sUj','eNsBR5nTUbqZgW0JzQYBY','interested');
INSERT INTO "votes" VALUES('7KYFsView354HRW4Hy0Ox','BS_uBronCbKREa-yEEKkP','eNsBR5nTUbqZgW0JzQYBY','maybe');
INSERT INTO "votes" VALUES('Onbq54RaqcShx85qz4eG-','_x7ZJyxlvtFtOyjWSyLOh','eNsBR5nTUbqZgW0JzQYBY','interested');
INSERT INTO "votes" VALUES('i28HHSMkhEF0J0zsAJs56','Kizq8EmvXGR-buAVPTVxb','eNsBR5nTUbqZgW0JzQYBY','maybe');
INSERT INTO "votes" VALUES('CW37MG55cNcvIkyhp3q8q','QKz5ST--_eq7yHltpXK8-','eNsBR5nTUbqZgW0JzQYBY','maybe');
INSERT INTO "votes" VALUES('G-wpB_jdKwyE4AUj4s6Qr','Asnej6V3vXniwIcJeL-iv','eNsBR5nTUbqZgW0JzQYBY','maybe');
INSERT INTO "votes" VALUES('oJYpMSHA2V4rgcW0bDwci','T0vl6IHCkCI4FtjtbcLlF','KkSNBDEU1KRxBUbvn4mS8','interested');
INSERT INTO "votes" VALUES('Z04rumRn62cnjmquuS0Ng','hCo6YM0JDwS7OUeusmzRG','KkSNBDEU1KRxBUbvn4mS8','interested');
INSERT INTO "votes" VALUES('SdwRGL5wsT_6hcICaLguA','1R64rynqAya5F7kCxNKGZ','KkSNBDEU1KRxBUbvn4mS8','skip');
INSERT INTO "votes" VALUES('k0DAe9UkEm4NE_FBz_Ani','BS_uBronCbKREa-yEEKkP','KkSNBDEU1KRxBUbvn4mS8','skip');
INSERT INTO "votes" VALUES('Twick8FrD3mjIoDHwJaGD','2WWSai5rKvKdVtMLauu4W','KkSNBDEU1KRxBUbvn4mS8','maybe');
INSERT INTO "votes" VALUES('fdRbUpZEcxxF3vZct9Aq9','iA02gGEqR0ReOTj99g0nP','KkSNBDEU1KRxBUbvn4mS8','skip');
INSERT INTO "votes" VALUES('M3QYqszv-nOVFxvChYfGp','jzjV8N8Bhgx7BnJsWdRAa','KkSNBDEU1KRxBUbvn4mS8','interested');
INSERT INTO "votes" VALUES('xp8CrE5hTlTe6_0CAZxWF','9S7_RuWFCXZqFcMGm7sUj','CxdYNzzd9zNg8WvWozhwl','maybe');
INSERT INTO "votes" VALUES('qvJRyq_qXZDvawhWqeiGN','1R64rynqAya5F7kCxNKGZ','CxdYNzzd9zNg8WvWozhwl','skip');
INSERT INTO "votes" VALUES('PXYO2YZhkYZKEJK7kQnTs','BS_uBronCbKREa-yEEKkP','CxdYNzzd9zNg8WvWozhwl','skip');
INSERT INTO "votes" VALUES('S3hTzFzrbZqd2bb_aPRFg','2WWSai5rKvKdVtMLauu4W','CxdYNzzd9zNg8WvWozhwl','maybe');
INSERT INTO "votes" VALUES('uqfVQKIVoFNhuCiVJ1OPP','eO6NPsnTxvjPiD6g8jOa8','CxdYNzzd9zNg8WvWozhwl','maybe');
INSERT INTO "votes" VALUES('a9-c0auETMKr3LN3ennKG','LExhIDOlSStuRcwIiOoEe','CxdYNzzd9zNg8WvWozhwl','interested');
INSERT INTO "votes" VALUES('j8HdSlLdJmn02OKd8n-AT','jzjV8N8Bhgx7BnJsWdRAa','CxdYNzzd9zNg8WvWozhwl','interested');
INSERT INTO "votes" VALUES('X09O4rcm6Zcx6yDGekHh3','3jP4LS6De_73-__3qsoYC','gV5Pdbxs5O1DABEVnyb57','maybe');
INSERT INTO "votes" VALUES('UhCgu6bfVJonNNmTlks03','x9ZvfRHasYEgj2LLzeC4d','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('YW2axC_mDXHocHAm0o7dk','1R64rynqAya5F7kCxNKGZ','gV5Pdbxs5O1DABEVnyb57','maybe');
INSERT INTO "votes" VALUES('GtcfTiy3AdkhyOJ5Qpys6','2WWSai5rKvKdVtMLauu4W','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('O3vP5KXurSrnQDlKca51u','iA02gGEqR0ReOTj99g0nP','gV5Pdbxs5O1DABEVnyb57','maybe');
INSERT INTO "votes" VALUES('2NQZCR7DrEkbM3TUV2omv','sFaY19y0fc_kYDeAIxphd','gV5Pdbxs5O1DABEVnyb57','interested');
INSERT INTO "votes" VALUES('Uzuci8V5KfUfYKq3DWy6P','3jP4LS6De_73-__3qsoYC','zUSsq4NQgbap_Ra7XRDVw','maybe');
INSERT INTO "votes" VALUES('9G25oNs6n59ZLudq4_p_g','hCo6YM0JDwS7OUeusmzRG','zUSsq4NQgbap_Ra7XRDVw','interested');
INSERT INTO "votes" VALUES('vAwpkK6bQu3n3qVMv4bbC','x9ZvfRHasYEgj2LLzeC4d','zUSsq4NQgbap_Ra7XRDVw','skip');
INSERT INTO "votes" VALUES('h5N19JkYpF3pqQQLu9nHS','1R64rynqAya5F7kCxNKGZ','zUSsq4NQgbap_Ra7XRDVw','maybe');
INSERT INTO "votes" VALUES('MXrjKpMJsP0qpPGZnbM94','BS_uBronCbKREa-yEEKkP','zUSsq4NQgbap_Ra7XRDVw','skip');
INSERT INTO "votes" VALUES('ila5L6khk9dYxXBWtPx95','eO6NPsnTxvjPiD6g8jOa8','zUSsq4NQgbap_Ra7XRDVw','interested');
INSERT INTO "votes" VALUES('X-8XM2yHRwumP0gHpe0f5','iA02gGEqR0ReOTj99g0nP','zUSsq4NQgbap_Ra7XRDVw','interested');
INSERT INTO "votes" VALUES('qzBnTMIzyYtlSOI4s5T_q','_x7ZJyxlvtFtOyjWSyLOh','zUSsq4NQgbap_Ra7XRDVw','interested');
INSERT INTO "votes" VALUES('Ygkh6a7Ips2eeEs0dGMmo','sFaY19y0fc_kYDeAIxphd','zUSsq4NQgbap_Ra7XRDVw','skip');
INSERT INTO "votes" VALUES('ppWow51TihTHsFaBDLt3e','_TkjOr_sYiCUpd8O0U--a','zUSsq4NQgbap_Ra7XRDVw','maybe');
INSERT INTO "votes" VALUES('r0R1yrJL3lossEQTwgCyP','T0vl6IHCkCI4FtjtbcLlF','YeG2otpf2ApAtRzLip5fA','skip');
INSERT INTO "votes" VALUES('zI79ldz4t8RvsQyym75K8','x9ZvfRHasYEgj2LLzeC4d','YeG2otpf2ApAtRzLip5fA','skip');
INSERT INTO "votes" VALUES('ZQk7uA9IdmWnIm5TOyaMU','1R64rynqAya5F7kCxNKGZ','YeG2otpf2ApAtRzLip5fA','maybe');
INSERT INTO "votes" VALUES('A8SordVEEJkFY_34doDTs','Pza1FhINB26ILPRHXsJ6U','YeG2otpf2ApAtRzLip5fA','maybe');
INSERT INTO "votes" VALUES('3TsJrV3aReykY_8ExIBK6','iA02gGEqR0ReOTj99g0nP','YeG2otpf2ApAtRzLip5fA','interested');
INSERT INTO "votes" VALUES('Q6A8vlVV4UdkuF9SrIC3o','jzjV8N8Bhgx7BnJsWdRAa','YeG2otpf2ApAtRzLip5fA','skip');
INSERT INTO "votes" VALUES('9jyHDKftea_2Ad8Y7Cci7','_TkjOr_sYiCUpd8O0U--a','YeG2otpf2ApAtRzLip5fA','skip');
INSERT INTO "votes" VALUES('DcQ7Jw2kUCVzsG3kNdhpe','9S7_RuWFCXZqFcMGm7sUj','1eJpl348zRLcRaHJ_UOpf','interested');
INSERT INTO "votes" VALUES('XXroflXNvjo3tyXBPkZHw','3jP4LS6De_73-__3qsoYC','1eJpl348zRLcRaHJ_UOpf','maybe');
INSERT INTO "votes" VALUES('fyeZJe8-AvJuqQ3sQ2v_u','_TkjOr_sYiCUpd8O0U--a','1eJpl348zRLcRaHJ_UOpf','maybe');
INSERT INTO "votes" VALUES('U4-w3ZMWWH21yBt5JzkBO','9S7_RuWFCXZqFcMGm7sUj','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('KgK0c4Gi7HP33-5IUaeF1','hCo6YM0JDwS7OUeusmzRG','TOdqxAjiJWhO61YMs4KIq','interested');
INSERT INTO "votes" VALUES('Y0-GzzUCgj0X0IT6JEp5B','x9ZvfRHasYEgj2LLzeC4d','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('unpq8WrXMa78NgkMUh-qS','1R64rynqAya5F7kCxNKGZ','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('9FK60ILSsoCxSgywwtLs-','BS_uBronCbKREa-yEEKkP','TOdqxAjiJWhO61YMs4KIq','skip');
INSERT INTO "votes" VALUES('KqDUqzyaZhJyAsPC4NncZ','LExhIDOlSStuRcwIiOoEe','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('WPvg2MpTqh6DHhxiGkLnE','sFaY19y0fc_kYDeAIxphd','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('dpLhso02dkkSn11PsdNaX','Asnej6V3vXniwIcJeL-iv','TOdqxAjiJWhO61YMs4KIq','skip');
INSERT INTO "votes" VALUES('-nxXlfQpOxdXOlS3d5LJF','jzjV8N8Bhgx7BnJsWdRAa','TOdqxAjiJWhO61YMs4KIq','maybe');
INSERT INTO "votes" VALUES('LQVAD9REmGwAdAId0f9Tr','3jP4LS6De_73-__3qsoYC','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('AqLS3xLHB9UiEuyEZGYll','Pza1FhINB26ILPRHXsJ6U','dhYAUZrm_UZ9ZVIt1Fc3I','maybe');
INSERT INTO "votes" VALUES('LpxLdDgUncCUp8OZlci8v','BS_uBronCbKREa-yEEKkP','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('7yA7lVJk4rRDzZ2kb-PUi','2WWSai5rKvKdVtMLauu4W','dhYAUZrm_UZ9ZVIt1Fc3I','maybe');
INSERT INTO "votes" VALUES('KYvPaeOUjmkEXaLtsPToy','eO6NPsnTxvjPiD6g8jOa8','dhYAUZrm_UZ9ZVIt1Fc3I','maybe');
INSERT INTO "votes" VALUES('ltQcP7bPsiDAJQLQq1h1m','Kizq8EmvXGR-buAVPTVxb','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('Hzd6ujwAdEHJIVQ-CD1Gb','LExhIDOlSStuRcwIiOoEe','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('-9PUN6t90o4sfWMNt-OzL','sFaY19y0fc_kYDeAIxphd','dhYAUZrm_UZ9ZVIt1Fc3I','interested');
INSERT INTO "votes" VALUES('uCV7_jjvQV6WuYvsRK-Xh','_TkjOr_sYiCUpd8O0U--a','dhYAUZrm_UZ9ZVIt1Fc3I','skip');
INSERT INTO "votes" VALUES('RAe5Dj0DtDTKvZCgycHif','T0vl6IHCkCI4FtjtbcLlF','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('iGCFIa_hMYsZTnneqQON4','3jP4LS6De_73-__3qsoYC','EYktZR73XPPhHEtfufNWC','skip');
INSERT INTO "votes" VALUES('QvE6CPp51IvFaLQT40-rp','eO6NPsnTxvjPiD6g8jOa8','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('inDdu7ynkkOl6iPiwjCX8','Kizq8EmvXGR-buAVPTVxb','EYktZR73XPPhHEtfufNWC','maybe');
INSERT INTO "votes" VALUES('uP14H2HKqlPCu9EiCSv4v','jzjV8N8Bhgx7BnJsWdRAa','EYktZR73XPPhHEtfufNWC','interested');
INSERT INTO "votes" VALUES('mD4BFpL1vg7BH9eGcGfu8','T0vl6IHCkCI4FtjtbcLlF','TqxaBp5UbN2fEbaEHW6gT','interested');
INSERT INTO "votes" VALUES('Rz5TAqH9jb2FbtvnJukat','hCo6YM0JDwS7OUeusmzRG','TqxaBp5UbN2fEbaEHW6gT','interested');
INSERT INTO "votes" VALUES('Xj0kZOJmPWcQ3Hw4TelVK','1R64rynqAya5F7kCxNKGZ','TqxaBp5UbN2fEbaEHW6gT','skip');
INSERT INTO "votes" VALUES('nrIOCKcGvvscr3x07tPpE','Pza1FhINB26ILPRHXsJ6U','TqxaBp5UbN2fEbaEHW6gT','maybe');
INSERT INTO "votes" VALUES('RsDEFD0MMQN4yDxAKurSG','BS_uBronCbKREa-yEEKkP','TqxaBp5UbN2fEbaEHW6gT','maybe');
INSERT INTO "votes" VALUES('tZbsXh9cJtB1mm3ZpKgUA','_x7ZJyxlvtFtOyjWSyLOh','TqxaBp5UbN2fEbaEHW6gT','interested');
INSERT INTO "votes" VALUES('JCpiuZgZ8o979MKwkMaNe','Kizq8EmvXGR-buAVPTVxb','TqxaBp5UbN2fEbaEHW6gT','interested');
INSERT INTO "votes" VALUES('Hq2GcIXBBNvf8S77uVwVD','9S7_RuWFCXZqFcMGm7sUj','A4MXoQcNzjViz8steJ9w3','maybe');
INSERT INTO "votes" VALUES('Tj3Xz8bkow8KHVDn62sxI','x9ZvfRHasYEgj2LLzeC4d','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('pUqJzTKp8elX1Pxwqsnx_','1R64rynqAya5F7kCxNKGZ','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('XKWNPivsjH7sTdNneKdM_','BS_uBronCbKREa-yEEKkP','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('rCGvoS0tDiE19Lj07oitJ','2WWSai5rKvKdVtMLauu4W','A4MXoQcNzjViz8steJ9w3','maybe');
INSERT INTO "votes" VALUES('Y9M1DOraLWamtHaCF2jYF','eO6NPsnTxvjPiD6g8jOa8','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('C-xfz0MWnTLVhPg8WxuU3','iA02gGEqR0ReOTj99g0nP','A4MXoQcNzjViz8steJ9w3','skip');
INSERT INTO "votes" VALUES('dgLA-wSZGIbJuuIrryoDY','QKz5ST--_eq7yHltpXK8-','A4MXoQcNzjViz8steJ9w3','maybe');
INSERT INTO "votes" VALUES('fzcHKHiwUwZK_Ez5kpuoR','sFaY19y0fc_kYDeAIxphd','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('JS2lErvUW95kZlOxR04QC','_TkjOr_sYiCUpd8O0U--a','A4MXoQcNzjViz8steJ9w3','interested');
INSERT INTO "votes" VALUES('uTzHlOXDlY2iuVFj8OwhM','eO6NPsnTxvjPiD6g8jOa8','KO07-qB9ijetC-IRL3hAK','skip');
INSERT INTO "votes" VALUES('76GFHKXMHMl3Mu_uGRzsc','iA02gGEqR0ReOTj99g0nP','KO07-qB9ijetC-IRL3hAK','interested');
INSERT INTO "votes" VALUES('ojK9lFYaFH4VbW8XkQeP-','_x7ZJyxlvtFtOyjWSyLOh','KO07-qB9ijetC-IRL3hAK','skip');
INSERT INTO "votes" VALUES('VeD3b8Tupo8Ixsn-J5PUh','QKz5ST--_eq7yHltpXK8-','KO07-qB9ijetC-IRL3hAK','maybe');
INSERT INTO "votes" VALUES('A9TtvWaQVs1WDNTle3hcs','LExhIDOlSStuRcwIiOoEe','KO07-qB9ijetC-IRL3hAK','maybe');
INSERT INTO "votes" VALUES('-QZ5SQu994ATa8ie3khOL','Asnej6V3vXniwIcJeL-iv','KO07-qB9ijetC-IRL3hAK','skip');
INSERT INTO "votes" VALUES('a2ZK0ifhHCyFSeifip7_p','_TkjOr_sYiCUpd8O0U--a','KO07-qB9ijetC-IRL3hAK','maybe');
INSERT INTO "votes" VALUES('vqai6bGtraJDxMCsk0lr8','3jP4LS6De_73-__3qsoYC','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('F6YiPay8nvhPDc9Yz7HUO','hCo6YM0JDwS7OUeusmzRG','fFhh4S6EWUdJtR91qLZSB','interested');
INSERT INTO "votes" VALUES('mQ2n1QY8KEENVjKF9ff8a','x9ZvfRHasYEgj2LLzeC4d','fFhh4S6EWUdJtR91qLZSB','interested');
INSERT INTO "votes" VALUES('0QiOWRjJvKk_kVXQ4ggsJ','Pza1FhINB26ILPRHXsJ6U','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('_vmIDpJTX6CUXykrMJzDO','BS_uBronCbKREa-yEEKkP','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('uZy_zBglgUSZI9RO9Cw10','eO6NPsnTxvjPiD6g8jOa8','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('QiUuPDvkJb6dHuW84wYcF','_x7ZJyxlvtFtOyjWSyLOh','fFhh4S6EWUdJtR91qLZSB','interested');
INSERT INTO "votes" VALUES('Jio93F564IPu_woQYPDs2','jzjV8N8Bhgx7BnJsWdRAa','fFhh4S6EWUdJtR91qLZSB','maybe');
INSERT INTO "votes" VALUES('ygxux7Ry4GgJ3fU2xmsR9','T0vl6IHCkCI4FtjtbcLlF','iGkaKua4rLriedEAt_MZe','maybe');
INSERT INTO "votes" VALUES('Hr01cu42-HBL50dNqDy35','9S7_RuWFCXZqFcMGm7sUj','iGkaKua4rLriedEAt_MZe','maybe');
INSERT INTO "votes" VALUES('r7lAKkUHSmKepHnOv3F9n','BS_uBronCbKREa-yEEKkP','iGkaKua4rLriedEAt_MZe','interested');
INSERT INTO "votes" VALUES('FBpO3kbMaOpIxiiz566w3','iA02gGEqR0ReOTj99g0nP','iGkaKua4rLriedEAt_MZe','maybe');
INSERT INTO "votes" VALUES('rm4bUUqsreRbHV-ZuxCyh','_x7ZJyxlvtFtOyjWSyLOh','iGkaKua4rLriedEAt_MZe','maybe');
INSERT INTO "votes" VALUES('8JXPScqXpGYsfF7qAAkDx','Asnej6V3vXniwIcJeL-iv','iGkaKua4rLriedEAt_MZe','interested');
INSERT INTO "votes" VALUES('QHJJfGl_wezDKbAvq_Wso','_TkjOr_sYiCUpd8O0U--a','iGkaKua4rLriedEAt_MZe','interested');
INSERT INTO "votes" VALUES('a9-3BrbEEDO92NyTwMOIe','hCo6YM0JDwS7OUeusmzRG','jds6LoJtOps4RVLotRc7Q','skip');
INSERT INTO "votes" VALUES('BcDc_tVb8VTGO6fRs3qh4','1R64rynqAya5F7kCxNKGZ','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('wI56tkyEfL0V5VIH4BeYl','2WWSai5rKvKdVtMLauu4W','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('td14TBA4u34h0PwGMqnD2','iA02gGEqR0ReOTj99g0nP','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('oilSVmHtTjJtOmEohm_rU','QKz5ST--_eq7yHltpXK8-','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('rRPvM46Lt-uyX5LUzQMCT','sFaY19y0fc_kYDeAIxphd','jds6LoJtOps4RVLotRc7Q','skip');
INSERT INTO "votes" VALUES('OdmA4FF-NrasPLYBGn6J8','Asnej6V3vXniwIcJeL-iv','jds6LoJtOps4RVLotRc7Q','skip');
INSERT INTO "votes" VALUES('nsJ2tt1KZc-TtsEF_2OP0','jzjV8N8Bhgx7BnJsWdRAa','jds6LoJtOps4RVLotRc7Q','interested');
INSERT INTO "votes" VALUES('bBtzQZjakmkcNebvSOPKy','_TkjOr_sYiCUpd8O0U--a','jds6LoJtOps4RVLotRc7Q','maybe');
INSERT INTO "votes" VALUES('cLIp05AsG-bQ8oCpKxY6H','T0vl6IHCkCI4FtjtbcLlF','JHHtBOTwqPIYOez-GGyLp','skip');
INSERT INTO "votes" VALUES('5hlNwBZ2HKLNFoKShEOa0','hCo6YM0JDwS7OUeusmzRG','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('SBE1TBYHP7OixtEWGWF9f','Pza1FhINB26ILPRHXsJ6U','JHHtBOTwqPIYOez-GGyLp','skip');
INSERT INTO "votes" VALUES('UyyaNtbasoq5VZXJencgr','2WWSai5rKvKdVtMLauu4W','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('C_x8ZtLbj61P_YVYT-ey0','iA02gGEqR0ReOTj99g0nP','JHHtBOTwqPIYOez-GGyLp','maybe');
INSERT INTO "votes" VALUES('FJoK7EqvKp_Tvmbs4xRGb','Kizq8EmvXGR-buAVPTVxb','JHHtBOTwqPIYOez-GGyLp','maybe');
INSERT INTO "votes" VALUES('VoJ9APAHPV_FAudx2gdru','LExhIDOlSStuRcwIiOoEe','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('LuARXPCZt-2_wrIfPt5q6','jzjV8N8Bhgx7BnJsWdRAa','JHHtBOTwqPIYOez-GGyLp','interested');
INSERT INTO "votes" VALUES('zCT6685tpyenKAbqkSzUq','T0vl6IHCkCI4FtjtbcLlF','LKan9xhO4jTTKHoHxNxe_','skip');
INSERT INTO "votes" VALUES('T64dSEs9i4_bpf1v8QVEt','3jP4LS6De_73-__3qsoYC','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('qjPqmV4cOyHcq4WcMhTEa','eO6NPsnTxvjPiD6g8jOa8','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('J1CVUo7Z9lnQC2YvVy207','_x7ZJyxlvtFtOyjWSyLOh','LKan9xhO4jTTKHoHxNxe_','skip');
INSERT INTO "votes" VALUES('WyGJKkcV-aw45VAYqMVGD','QKz5ST--_eq7yHltpXK8-','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('KGdxe6xFMvD8YSYfV1ktm','LExhIDOlSStuRcwIiOoEe','LKan9xhO4jTTKHoHxNxe_','skip');
INSERT INTO "votes" VALUES('ZTwB6mbr5lcsjAam7ti2l','jzjV8N8Bhgx7BnJsWdRAa','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('mDAREfyD6Q3NmTLWYsQu7','_TkjOr_sYiCUpd8O0U--a','LKan9xhO4jTTKHoHxNxe_','interested');
INSERT INTO "votes" VALUES('Z0kSXh83UuhwcG_feClRQ','9S7_RuWFCXZqFcMGm7sUj','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('PewRlZKJUUv95xbsr83N_','3jP4LS6De_73-__3qsoYC','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('xlX6qYK7K2Iag9pWbZx57','hCo6YM0JDwS7OUeusmzRG','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('dXoEYjlYUB8Mto51vpZ0G','1R64rynqAya5F7kCxNKGZ','W2bpVPegVLtZ00YHFeBZM','skip');
INSERT INTO "votes" VALUES('YwQw5Rcp1OON9-P5CRxaY','2WWSai5rKvKdVtMLauu4W','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('JifXI4srNmxXFiMMVOaNx','eO6NPsnTxvjPiD6g8jOa8','W2bpVPegVLtZ00YHFeBZM','maybe');
INSERT INTO "votes" VALUES('44izU0iAzn2zAcobra68R','iA02gGEqR0ReOTj99g0nP','W2bpVPegVLtZ00YHFeBZM','interested');
INSERT INTO "votes" VALUES('iUjHmLQ-fAkNqzMCgbI7M','_TkjOr_sYiCUpd8O0U--a','W2bpVPegVLtZ00YHFeBZM','skip');
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
, `slot_increment_minutes` integer DEFAULT 30 NOT NULL, `rsvp_capacity_hard_limit` integer DEFAULT false NOT NULL, `meetings_enabled` integer DEFAULT false NOT NULL, `max_open_meeting_requests` integer DEFAULT 5 NOT NULL, `version` integer DEFAULT 1 NOT NULL, `identity_mode` text DEFAULT 'open' NOT NULL);
INSERT INTO "events" VALUES('-D7eLgFNVCGXbS6sFHxT5','Conference Alpha','Conference-Alpha','Event currently in proposal phase','https://test-event-1.example.com','2026-11-04T12:55:10.524Z','2026-11-18T12:55:10.524Z','2026-11-18T12:55:10.524Z','2026-12-02T12:55:10.524Z','2026-12-02T12:55:10.524Z','2026-12-25T17:00:00.000Z',120,10,'Europe/Berlin','AcademicCapIcon',30,0,1,5,1,'open');
INSERT INTO "events" VALUES('AycNOr2kRijxOeqMKZp6N','Conference Beta','Conference-Beta','Event currently in **voting** phase — cast your votes and check the [event website](https://test-event-2.example.com) for updates.','https://test-event-2.example.com','2026-10-21T11:55:10.524Z','2026-11-04T12:55:10.524Z','2026-11-04T12:55:10.524Z','2026-11-18T12:55:10.524Z','2026-11-18T12:55:10.524Z','2026-12-11T17:00:00.000Z',120,10,'Europe/Berlin','BeakerIcon',30,0,1,5,1,'open');
INSERT INTO "events" VALUES('UYLjQ2vfV0lUt6zpqB92I','Conference Gamma','Conference-Gamma','Event currently in **scheduling phase**.

### Quick links

- [Venue map](https://test-event-3.example.com/map)
- [Code of conduct](https://test-event-3.example.com/coc)','https://test-event-3.example.com','2026-10-07T11:55:10.524Z','2026-10-21T11:55:10.524Z','2026-10-21T11:55:10.524Z','2026-11-04T12:55:10.524Z','2026-11-04T12:55:10.524Z','2026-11-28T02:00:00.000Z',120,10,'Europe/Berlin','GlobeAltIcon',30,0,1,5,1,'open');
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
	`event_id` text NOT NULL, `attendee_count` integer, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "sessions" VALUES('D46syHfk85g9w2hDHwyjt','Opening Keynote - Conference Alpha','Welcome to Conference Alpha','2026-12-23T08:00:00.000Z','2026-12-23T09:30:00.000Z',100,1,0,0,NULL,'-D7eLgFNVCGXbS6sFHxT5',NULL,1);
INSERT INTO "sessions" VALUES('y-jDOa_dq4pH_veGs_18j','Lunch Break','','2026-12-23T11:30:00.000Z','2026-12-23T13:00:00.000Z',0,1,1,0,NULL,'-D7eLgFNVCGXbS6sFHxT5',NULL,1);
INSERT INTO "sessions" VALUES('HTRss7aGMtqBAOwY3J6kG','Lunch Break','','2026-12-24T11:30:00.000Z','2026-12-24T13:00:00.000Z',0,1,1,0,NULL,'-D7eLgFNVCGXbS6sFHxT5',NULL,1);
INSERT INTO "sessions" VALUES('hNeSMt7a9xlsbNdYia03i','Lunch Break','','2026-12-25T11:30:00.000Z','2026-12-25T13:00:00.000Z',0,1,1,0,NULL,'-D7eLgFNVCGXbS6sFHxT5',NULL,1);
INSERT INTO "sessions" VALUES('jKYmOmhgIXCz9yXr6OV9G','Opening Keynote - Conference Beta','Welcome to Conference Beta','2026-12-09T08:00:00.000Z','2026-12-09T09:30:00.000Z',100,1,0,0,NULL,'AycNOr2kRijxOeqMKZp6N',NULL,1);
INSERT INTO "sessions" VALUES('ZLh56c1B1Tp92rpx-rQVs','Lunch Break','','2026-12-09T11:30:00.000Z','2026-12-09T13:00:00.000Z',0,1,1,0,NULL,'AycNOr2kRijxOeqMKZp6N',NULL,1);
INSERT INTO "sessions" VALUES('WCZBBqybIRWcZiIhVdWsL','Lunch Break','','2026-12-10T11:30:00.000Z','2026-12-10T13:00:00.000Z',0,1,1,0,NULL,'AycNOr2kRijxOeqMKZp6N',NULL,1);
INSERT INTO "sessions" VALUES('_cgjMMUSGHmhKArgCskCH','Lunch Break','','2026-12-11T11:30:00.000Z','2026-12-11T13:00:00.000Z',0,1,1,0,NULL,'AycNOr2kRijxOeqMKZp6N',NULL,1);
INSERT INTO "sessions" VALUES('TF8CWD0HSXPjvBhfiBq_H','Opening Keynote - Conference Gamma','Welcome to Conference Gamma','2026-11-25T08:00:00.000Z','2026-11-25T09:30:00.000Z',100,1,0,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('ftudVNBLNLIGQkVzpm_bo','Lunch Break','','2026-11-25T11:30:00.000Z','2026-11-25T13:00:00.000Z',0,1,1,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('4N_XS4vKa9htcaMUJTEnR','Lunch Break','','2026-11-26T11:30:00.000Z','2026-11-26T13:00:00.000Z',0,1,1,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('4DDK2NtStsYtnDWfZszPv','Lunch Break','','2026-11-27T11:30:00.000Z','2026-11-27T13:00:00.000Z',0,1,1,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('25hZDqvtt-mI3Gybn_yOr','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT','2026-11-25T10:10:00.000Z','2026-11-25T11:00:00.000Z',100,0,0,0,'9S7_RuWFCXZqFcMGm7sUj','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('lqEHzM6naNa1QUtKarB_9','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort','2026-11-25T10:10:00.000Z','2026-11-25T11:30:00.000Z',30,0,0,1,'3jP4LS6De_73-__3qsoYC','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('7jn_r5fNOAoLvzybLSGvS','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.','2026-11-25T13:10:00.000Z','2026-11-25T14:00:00.000Z',100,0,0,0,'hCo6YM0JDwS7OUeusmzRG','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('JPUgkpWdrUEQL2tSFurQX','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.','2026-11-25T13:10:00.000Z','2026-11-25T14:30:00.000Z',25,0,0,0,'Kizq8EmvXGR-buAVPTVxb','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('IeVRrak7i_3Kt_p1b4Q-b','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.','2026-11-25T14:40:00.000Z','2026-11-25T15:30:00.000Z',30,0,0,0,'2WWSai5rKvKdVtMLauu4W','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('TVCqKurF5iJYaX2VQCJOq','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.','2026-11-26T08:10:00.000Z','2026-11-26T09:00:00.000Z',100,0,0,0,'T0vl6IHCkCI4FtjtbcLlF','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('aW3SSczqWM_rte9wglKrE','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.','2026-11-26T09:10:00.000Z','2026-11-26T10:30:00.000Z',25,0,0,0,'eO6NPsnTxvjPiD6g8jOa8','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('4xJK7N6kK-HvKzjCTYzP7','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.','2026-11-26T09:40:00.000Z','2026-11-26T11:00:00.000Z',30,0,0,0,'_x7ZJyxlvtFtOyjWSyLOh','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('0UyRbeLlVU_6KKIgTth3k','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.','2026-11-26T13:10:00.000Z','2026-11-26T14:00:00.000Z',100,0,0,0,'LExhIDOlSStuRcwIiOoEe','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('7TbZvUTKrbYopR-QgFp3y','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.','2026-11-26T13:10:00.000Z','2026-11-26T14:00:00.000Z',25,0,0,0,'Pza1FhINB26ILPRHXsJ6U','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('u8XicmKS_DxHyRKM0ebga','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.','2026-11-26T15:10:00.000Z','2026-11-26T16:00:00.000Z',100,0,0,0,'BS_uBronCbKREa-yEEKkP','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('8jkog8QWIvGrZQthOxeRD','Hallway Track: CRDT Show & Tell','Impromptu session: I''ll demo a small real-time collaborative editor built on [CRDTs](https://crdt.tech) and we can poke at the edge cases together. Bring your laptop if you want to pair on it.

Added straight to the schedule because the hallway conversation got out of hand — *that''s what open scheduling is for!*','2026-11-26T15:10:00.000Z','2026-11-26T15:30:00.000Z',15,0,0,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('ghV6TCMqNZE_EsWPoUjCJ','Evening Wrap-up','Loose ends and goodbyes before dinner.','2026-11-26T16:40:00.000Z','2026-11-26T17:00:00.000Z',100,0,0,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('uT9nu0FJ-rIu4YzOfttLw','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.','2026-11-27T08:10:00.000Z','2026-11-27T09:00:00.000Z',100,0,0,0,'1R64rynqAya5F7kCxNKGZ','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('dR--X9EH-_rfZiT4kCAh1','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.','2026-11-27T09:10:00.000Z','2026-11-27T10:00:00.000Z',30,0,0,0,'iA02gGEqR0ReOTj99g0nP','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('2XiEUym2eyJE7437hicyP','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.','2026-11-27T09:40:00.000Z','2026-11-27T10:30:00.000Z',25,0,0,0,'QKz5ST--_eq7yHltpXK8-','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('UyCjYnsr2PNDgf2y1_3q2','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.','2026-11-27T13:10:00.000Z','2026-11-27T14:00:00.000Z',100,0,0,0,'x9ZvfRHasYEgj2LLzeC4d','UYLjQ2vfV0lUt6zpqB92I',NULL,1);
INSERT INTO "sessions" VALUES('Qz77siaU6Au34k-MT-kEs','Closing Session & Farewell','Wrap-up of Conference Gamma:

- Community announcements
- A look back at the highlights of the last three days
- Thank-yous to volunteers and speakers
- A preview of next year''s edition

We close with a group photo in front of the **Main Hall**.','2026-11-27T15:10:00.000Z','2026-11-27T16:00:00.000Z',100,1,0,0,NULL,'UYLjQ2vfV0lUt6zpqB92I',NULL,1);
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
INSERT INTO "comments" VALUES('mnewJD9JvTCE8N6Qz_mnF',NULL,NULL,'',1,'2026-11-11T02:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('V1T6Gp-l3gWIgEcOeVuiV','b_NkXrejyGIIaZAQW6c7A','mnewJD9JvTCE8N6Qz_mnF','Good question — no background needed, I''ll start from scratch.',0,'2026-11-11T03:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('pLz1fYkXdOzzRiOIQdoVB','iAdjF-EtX27_ccwI2NVWN','V1T6Gp-l3gWIgEcOeVuiV','Perfect, count me in.',0,'2026-11-11T04:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('ScYlKXrJGnfKgaaQ32Emu','VhgwSw2jmAxr8Rb53Conl',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-11T05:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('Rib0ojdWNxXsGPrtY8Pn2','VhgwSw2jmAxr8Rb53Conl',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-11T03:09:11.614Z',NULL);
INSERT INTO "comments" VALUES('1MaKyKLvWlhbuXa6cbTuE','JsDO81PGk2jhFzQmo-2ud',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-11T06:09:11.614Z',NULL);
INSERT INTO "comments" VALUES('TuLD3QPOoVjaN1T_fBFxy','yiwyv5a_bWUh_YLq3wV7_',NULL,'Could this be scheduled later in the day? It clashes with the workshop block.',0,'2026-11-11T03:23:11.614Z',NULL);
INSERT INTO "comments" VALUES('__utGWGwTuAWmMwH8JQpK','Wk7lndCBEZJn1NY-SjFz0','TuLD3QPOoVjaN1T_fBFxy','Good question — no background needed, I''ll start from scratch.',0,'2026-11-11T04:23:11.614Z',NULL);
INSERT INTO "comments" VALUES('MMvbPxO400uoFVQkbO16F','yiwyv5a_bWUh_YLq3wV7_',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-11T03:37:11.614Z',NULL);
INSERT INTO "comments" VALUES('yEiWDP9vzlmbjXBA6H0P7','b_NkXrejyGIIaZAQW6c7A',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-11T02:55:11.614Z','2026-11-11T02:59:11.614Z');
INSERT INTO "comments" VALUES('aToUoQ7c3iagVWa3Nhi6X','DVNAWsooAkCOWvX1Sp0H1','yEiWDP9vzlmbjXBA6H0P7','Good question — no background needed, I''ll start from scratch.',0,'2026-11-11T03:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('NkPnyh1FIrL8iWXRQPrIH','iAdjF-EtX27_ccwI2NVWN','aToUoQ7c3iagVWa3Nhi6X','Perfect, count me in.',0,'2026-11-11T04:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('D0bO8N3l-Uz906mn7ymx6','VhgwSw2jmAxr8Rb53Conl',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-11T05:55:11.614Z',NULL);
INSERT INTO "comments" VALUES('6evYEkLZlVOsUy1JY36b1','iAdjF-EtX27_ccwI2NVWN',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-11T03:09:11.614Z',NULL);
INSERT INTO "comments" VALUES('SuGXse3kw06oXirp_6nY_','wuMh9z-507W06D0wglsAg',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-11T03:44:11.614Z',NULL);
INSERT INTO "comments" VALUES('mNH0Dp73spCMo7G4Dsu35','Ocs_eOqCR0_EEXAuI55Fg','SuGXse3kw06oXirp_6nY_','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-11T04:44:11.614Z',NULL);
INSERT INTO "comments" VALUES('XEws1a4brWMOv5NtuWdV2','awxf7QqL3cb4WvzT4C7PI','mNH0Dp73spCMo7G4Dsu35','That makes sense, thanks for explaining!',0,'2026-11-11T05:44:11.614Z',NULL);
INSERT INTO "comments" VALUES('uKarlbYaPLBnqaX7jBE00','DVNAWsooAkCOWvX1Sp0H1',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-11T03:02:11.614Z',NULL);
INSERT INTO "comments" VALUES('yOqEfdT5SFJV_mCr_IfZU','VhgwSw2jmAxr8Rb53Conl','uKarlbYaPLBnqaX7jBE00','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-11T04:02:11.614Z',NULL);
INSERT INTO "comments" VALUES('grP9EsfmRD0ARQcxPjaTp','JsDO81PGk2jhFzQmo-2ud',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-11T03:30:11.614Z','2026-11-11T03:34:11.614Z');
INSERT INTO "comments" VALUES('7gSLlTfpQu_U5sD-RrVit','7M832wmyr7fp7NiWF71Ux','grP9EsfmRD0ARQcxPjaTp','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-11T04:30:11.614Z',NULL);
INSERT INTO "comments" VALUES('UpG6ctodBLowOKK8F9WOb','yiwyv5a_bWUh_YLq3wV7_','7gSLlTfpQu_U5sD-RrVit','That makes sense, thanks for explaining!',0,'2026-11-11T05:30:11.614Z',NULL);
INSERT INTO "comments" VALUES('Ak3kQKGv3_VYlztv3kDOf','yiwyv5a_bWUh_YLq3wV7_',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-11T03:37:11.614Z',NULL);
INSERT INTO "comments" VALUES('GmceQMshQ0Men0GQRNRm8','KkSNBDEU1KRxBUbvn4mS8','Ak3kQKGv3_VYlztv3kDOf','I''d rather keep them separate, they go in quite different directions.',0,'2026-11-11T04:37:11.614Z',NULL);
INSERT INTO "comments" VALUES('laklnYpMQ8wRODQuVdBEF','wuMh9z-507W06D0wglsAg','GmceQMshQ0Men0GQRNRm8','Perfect, count me in.',0,'2026-11-11T05:37:11.614Z',NULL);
INSERT INTO "comments" VALUES('NMbfmtvTAyz19agkhxqxL','Ocs_eOqCR0_EEXAuI55Fg',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-11T06:37:11.614Z',NULL);
INSERT INTO "comments" VALUES('wCztf8fkh8JMUaAocVkPt','Ocs_eOqCR0_EEXAuI55Fg',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-11T03:51:11.614Z',NULL);
INSERT INTO "comments" VALUES('EM7rWdASM_lRxzMlPq_DE','p7eh7GiHs_WQ0SmyqQ2rs',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-11T04:05:11.614Z','2026-11-11T04:09:11.614Z');
INSERT INTO "comments" VALUES('Jhkp7SHpNzWVdTxmgRFX4','p7eh7GiHs_WQ0SmyqQ2rs',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-11T04:12:11.614Z',NULL);
INSERT INTO "comments" VALUES('e2VUuH4HzgF35vfl9gpbT','iShv18yQvprVcDvxCQmmA',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-11T04:19:11.614Z',NULL);
INSERT INTO "comments" VALUES('YybHjdMw1xqRpKadYr1_s','iGkaKua4rLriedEAt_MZe','e2VUuH4HzgF35vfl9gpbT','Good question — no background needed, I''ll start from scratch.',0,'2026-11-11T05:19:11.614Z',NULL);
INSERT INTO "comments" VALUES('kipRcZMym1yrmwd8xd1Y7','XNmy3ygsgvUjjnni0qsxe','YybHjdMw1xqRpKadYr1_s','Perfect, count me in.',0,'2026-11-11T06:19:11.614Z',NULL);
INSERT INTO "comments" VALUES('-7W4-My6cTefr52rBL0e3','w81mxy1iPJdxLYvE__HBk',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-11T04:40:11.614Z','2026-11-11T04:44:11.614Z');
INSERT INTO "comments" VALUES('fdWpz0o0zH_CiDxKC-44P','fFhh4S6EWUdJtR91qLZSB','-7W4-My6cTefr52rBL0e3','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-11T05:40:11.614Z',NULL);
INSERT INTO "comments" VALUES('DkxkgreNYyC6PRnXdshyr','nwkMQXuSCjcT2u-kd5dLs',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-11T07:40:11.614Z',NULL);
INSERT INTO "comments" VALUES('P3RZJYDhtRUn4dtKNLwfK','nwkMQXuSCjcT2u-kd5dLs',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-11T04:54:11.615Z',NULL);
INSERT INTO "comments" VALUES('YJ3OSpKN9D8lZiKI0um5-','PZ6BrVj315Vvxw_nrYyZQ',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-11T05:01:11.615Z',NULL);
INSERT INTO "comments" VALUES('YeEys8xbHqAAclrB7AqSZ','VhgwSw2jmAxr8Rb53Conl',NULL,'Who else is on the panel?',0,'2026-11-11T07:55:11.615Z',NULL);
INSERT INTO "comments" VALUES('N9e3Dps6UfVKoEr-81w-A','Wk7lndCBEZJn1NY-SjFz0','YeEys8xbHqAAclrB7AqSZ','I''d like to join.',0,'2026-11-11T08:55:11.615Z',NULL);
INSERT INTO "comments" VALUES('rvqpS8bqcm09hbrOm8U2_','JsDO81PGk2jhFzQmo-2ud','YeEys8xbHqAAclrB7AqSZ','So would I.',0,'2026-11-11T09:55:11.615Z',NULL);
CREATE TABLE `proposal_comments` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_comments" VALUES('mnewJD9JvTCE8N6Qz_mnF','EwOlntThYK7FVlIxHCdfA');
INSERT INTO "proposal_comments" VALUES('V1T6Gp-l3gWIgEcOeVuiV','EwOlntThYK7FVlIxHCdfA');
INSERT INTO "proposal_comments" VALUES('pLz1fYkXdOzzRiOIQdoVB','EwOlntThYK7FVlIxHCdfA');
INSERT INTO "proposal_comments" VALUES('ScYlKXrJGnfKgaaQ32Emu','EwOlntThYK7FVlIxHCdfA');
INSERT INTO "proposal_comments" VALUES('Rib0ojdWNxXsGPrtY8Pn2','PHmbHeid0LEB0ixPuOr5g');
INSERT INTO "proposal_comments" VALUES('1MaKyKLvWlhbuXa6cbTuE','PHmbHeid0LEB0ixPuOr5g');
INSERT INTO "proposal_comments" VALUES('TuLD3QPOoVjaN1T_fBFxy','LA0UTc5ecPCtQ4fR7t_jJ');
INSERT INTO "proposal_comments" VALUES('__utGWGwTuAWmMwH8JQpK','LA0UTc5ecPCtQ4fR7t_jJ');
INSERT INTO "proposal_comments" VALUES('MMvbPxO400uoFVQkbO16F','Qomp7T99BJTfLqyLwSesy');
INSERT INTO "proposal_comments" VALUES('yEiWDP9vzlmbjXBA6H0P7','ANDNcmgsucqi5tcALiSY6');
INSERT INTO "proposal_comments" VALUES('aToUoQ7c3iagVWa3Nhi6X','ANDNcmgsucqi5tcALiSY6');
INSERT INTO "proposal_comments" VALUES('NkPnyh1FIrL8iWXRQPrIH','ANDNcmgsucqi5tcALiSY6');
INSERT INTO "proposal_comments" VALUES('D0bO8N3l-Uz906mn7ymx6','ANDNcmgsucqi5tcALiSY6');
INSERT INTO "proposal_comments" VALUES('6evYEkLZlVOsUy1JY36b1','lIDSDvobYN8lqHXvvhi6Q');
INSERT INTO "proposal_comments" VALUES('SuGXse3kw06oXirp_6nY_','W4NZWnMihokeCrP4FLCMV');
INSERT INTO "proposal_comments" VALUES('mNH0Dp73spCMo7G4Dsu35','W4NZWnMihokeCrP4FLCMV');
INSERT INTO "proposal_comments" VALUES('XEws1a4brWMOv5NtuWdV2','W4NZWnMihokeCrP4FLCMV');
INSERT INTO "proposal_comments" VALUES('uKarlbYaPLBnqaX7jBE00','9S7_RuWFCXZqFcMGm7sUj');
INSERT INTO "proposal_comments" VALUES('yOqEfdT5SFJV_mCr_IfZU','9S7_RuWFCXZqFcMGm7sUj');
INSERT INTO "proposal_comments" VALUES('grP9EsfmRD0ARQcxPjaTp','1R64rynqAya5F7kCxNKGZ');
INSERT INTO "proposal_comments" VALUES('7gSLlTfpQu_U5sD-RrVit','1R64rynqAya5F7kCxNKGZ');
INSERT INTO "proposal_comments" VALUES('UpG6ctodBLowOKK8F9WOb','1R64rynqAya5F7kCxNKGZ');
INSERT INTO "proposal_comments" VALUES('Ak3kQKGv3_VYlztv3kDOf','Pza1FhINB26ILPRHXsJ6U');
INSERT INTO "proposal_comments" VALUES('GmceQMshQ0Men0GQRNRm8','Pza1FhINB26ILPRHXsJ6U');
INSERT INTO "proposal_comments" VALUES('laklnYpMQ8wRODQuVdBEF','Pza1FhINB26ILPRHXsJ6U');
INSERT INTO "proposal_comments" VALUES('NMbfmtvTAyz19agkhxqxL','Pza1FhINB26ILPRHXsJ6U');
INSERT INTO "proposal_comments" VALUES('wCztf8fkh8JMUaAocVkPt','2WWSai5rKvKdVtMLauu4W');
INSERT INTO "proposal_comments" VALUES('EM7rWdASM_lRxzMlPq_DE','iA02gGEqR0ReOTj99g0nP');
INSERT INTO "proposal_comments" VALUES('Jhkp7SHpNzWVdTxmgRFX4','_x7ZJyxlvtFtOyjWSyLOh');
INSERT INTO "proposal_comments" VALUES('e2VUuH4HzgF35vfl9gpbT','Kizq8EmvXGR-buAVPTVxb');
INSERT INTO "proposal_comments" VALUES('YybHjdMw1xqRpKadYr1_s','Kizq8EmvXGR-buAVPTVxb');
INSERT INTO "proposal_comments" VALUES('kipRcZMym1yrmwd8xd1Y7','Kizq8EmvXGR-buAVPTVxb');
INSERT INTO "proposal_comments" VALUES('-7W4-My6cTefr52rBL0e3','sFaY19y0fc_kYDeAIxphd');
INSERT INTO "proposal_comments" VALUES('fdWpz0o0zH_CiDxKC-44P','sFaY19y0fc_kYDeAIxphd');
INSERT INTO "proposal_comments" VALUES('DkxkgreNYyC6PRnXdshyr','sFaY19y0fc_kYDeAIxphd');
INSERT INTO "proposal_comments" VALUES('P3RZJYDhtRUn4dtKNLwfK','jzjV8N8Bhgx7BnJsWdRAa');
INSERT INTO "proposal_comments" VALUES('YJ3OSpKN9D8lZiKI0um5-','_TkjOr_sYiCUpd8O0U--a');
INSERT INTO "proposal_comments" VALUES('YeEys8xbHqAAclrB7AqSZ','miY3JUW-fRAEsE7JoRg9I');
INSERT INTO "proposal_comments" VALUES('N9e3Dps6UfVKoEr-81w-A','miY3JUW-fRAEsE7JoRg9I');
INSERT INTO "proposal_comments" VALUES('rvqpS8bqcm09hbrOm8U2_','miY3JUW-fRAEsE7JoRg9I');
CREATE TABLE `comment_likes` (
	`comment_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`created_time` text NOT NULL,
	PRIMARY KEY(`comment_id`, `guest_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "comment_likes" VALUES('V1T6Gp-l3gWIgEcOeVuiV','iAdjF-EtX27_ccwI2NVWN','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('pLz1fYkXdOzzRiOIQdoVB','VhgwSw2jmAxr8Rb53Conl','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('pLz1fYkXdOzzRiOIQdoVB','Wk7lndCBEZJn1NY-SjFz0','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('pLz1fYkXdOzzRiOIQdoVB','JsDO81PGk2jhFzQmo-2ud','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('ScYlKXrJGnfKgaaQ32Emu','Wk7lndCBEZJn1NY-SjFz0','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('ScYlKXrJGnfKgaaQ32Emu','JsDO81PGk2jhFzQmo-2ud','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('Rib0ojdWNxXsGPrtY8Pn2','JsDO81PGk2jhFzQmo-2ud','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('Rib0ojdWNxXsGPrtY8Pn2','yiwyv5a_bWUh_YLq3wV7_','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('1MaKyKLvWlhbuXa6cbTuE','yiwyv5a_bWUh_YLq3wV7_','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('1MaKyKLvWlhbuXa6cbTuE','wuMh9z-507W06D0wglsAg','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('1MaKyKLvWlhbuXa6cbTuE','Ocs_eOqCR0_EEXAuI55Fg','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('TuLD3QPOoVjaN1T_fBFxy','wuMh9z-507W06D0wglsAg','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('__utGWGwTuAWmMwH8JQpK','Ocs_eOqCR0_EEXAuI55Fg','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('MMvbPxO400uoFVQkbO16F','MZjJiKbO-RGkvrvSMlyHZ','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('MMvbPxO400uoFVQkbO16F','awxf7QqL3cb4WvzT4C7PI','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('yEiWDP9vzlmbjXBA6H0P7','awxf7QqL3cb4WvzT4C7PI','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('NkPnyh1FIrL8iWXRQPrIH','iShv18yQvprVcDvxCQmmA','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('NkPnyh1FIrL8iWXRQPrIH','XNmy3ygsgvUjjnni0qsxe','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('NkPnyh1FIrL8iWXRQPrIH','u_uY2Tj4Y3FV2i-A6PG9P','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('D0bO8N3l-Uz906mn7ymx6','XNmy3ygsgvUjjnni0qsxe','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('D0bO8N3l-Uz906mn7ymx6','u_uY2Tj4Y3FV2i-A6PG9P','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('6evYEkLZlVOsUy1JY36b1','u_uY2Tj4Y3FV2i-A6PG9P','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('6evYEkLZlVOsUy1JY36b1','w81mxy1iPJdxLYvE__HBk','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('6evYEkLZlVOsUy1JY36b1','Fd3gPLbxQVivweWTS2OYu','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('SuGXse3kw06oXirp_6nY_','w81mxy1iPJdxLYvE__HBk','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('SuGXse3kw06oXirp_6nY_','Fd3gPLbxQVivweWTS2OYu','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('XEws1a4brWMOv5NtuWdV2','nwkMQXuSCjcT2u-kd5dLs','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('uKarlbYaPLBnqaX7jBE00','PZ6BrVj315Vvxw_nrYyZQ','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('uKarlbYaPLBnqaX7jBE00','7M832wmyr7fp7NiWF71Ux','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('uKarlbYaPLBnqaX7jBE00','gHLNm3ONuzcyMnDClj73-','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('yOqEfdT5SFJV_mCr_IfZU','7M832wmyr7fp7NiWF71Ux','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('grP9EsfmRD0ARQcxPjaTp','gHLNm3ONuzcyMnDClj73-','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('grP9EsfmRD0ARQcxPjaTp','eNsBR5nTUbqZgW0JzQYBY','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('grP9EsfmRD0ARQcxPjaTp','KkSNBDEU1KRxBUbvn4mS8','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('7gSLlTfpQu_U5sD-RrVit','eNsBR5nTUbqZgW0JzQYBY','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('7gSLlTfpQu_U5sD-RrVit','KkSNBDEU1KRxBUbvn4mS8','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('UpG6ctodBLowOKK8F9WOb','KkSNBDEU1KRxBUbvn4mS8','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('Ak3kQKGv3_VYlztv3kDOf','CxdYNzzd9zNg8WvWozhwl','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('GmceQMshQ0Men0GQRNRm8','gV5Pdbxs5O1DABEVnyb57','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('laklnYpMQ8wRODQuVdBEF','zUSsq4NQgbap_Ra7XRDVw','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('laklnYpMQ8wRODQuVdBEF','YeG2otpf2ApAtRzLip5fA','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('laklnYpMQ8wRODQuVdBEF','1eJpl348zRLcRaHJ_UOpf','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('NMbfmtvTAyz19agkhxqxL','YeG2otpf2ApAtRzLip5fA','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('NMbfmtvTAyz19agkhxqxL','1eJpl348zRLcRaHJ_UOpf','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('wCztf8fkh8JMUaAocVkPt','1eJpl348zRLcRaHJ_UOpf','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('wCztf8fkh8JMUaAocVkPt','TOdqxAjiJWhO61YMs4KIq','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('wCztf8fkh8JMUaAocVkPt','dhYAUZrm_UZ9ZVIt1Fc3I','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('EM7rWdASM_lRxzMlPq_DE','TOdqxAjiJWhO61YMs4KIq','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('-7W4-My6cTefr52rBL0e3','KO07-qB9ijetC-IRL3hAK','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('fdWpz0o0zH_CiDxKC-44P','KO07-qB9ijetC-IRL3hAK','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('fdWpz0o0zH_CiDxKC-44P','iGkaKua4rLriedEAt_MZe','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('DkxkgreNYyC6PRnXdshyr','iGkaKua4rLriedEAt_MZe','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('P3RZJYDhtRUn4dtKNLwfK','jds6LoJtOps4RVLotRc7Q','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('YeEys8xbHqAAclrB7AqSZ','LKan9xhO4jTTKHoHxNxe_','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('YeEys8xbHqAAclrB7AqSZ','W2bpVPegVLtZ00YHFeBZM','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('YeEys8xbHqAAclrB7AqSZ','b_NkXrejyGIIaZAQW6c7A','2026-11-11T11:53:11.615Z');
INSERT INTO "comment_likes" VALUES('N9e3Dps6UfVKoEr-81w-A','W2bpVPegVLtZ00YHFeBZM','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('rvqpS8bqcm09hbrOm8U2_','b_NkXrejyGIIaZAQW6c7A','2026-11-11T11:55:11.615Z');
INSERT INTO "comment_likes" VALUES('rvqpS8bqcm09hbrOm8U2_','DVNAWsooAkCOWvX1Sp0H1','2026-11-11T11:54:11.615Z');
INSERT INTO "comment_likes" VALUES('rvqpS8bqcm09hbrOm8U2_','iAdjF-EtX27_ccwI2NVWN','2026-11-11T11:53:11.615Z');
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
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-23T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-24T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','b_NkXrejyGIIaZAQW6c7A','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','VhgwSw2jmAxr8Rb53Conl','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','yiwyv5a_bWUh_YLq3wV7_','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','MZjJiKbO-RGkvrvSMlyHZ','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','iShv18yQvprVcDvxCQmmA','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','w81mxy1iPJdxLYvE__HBk','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','PZ6BrVj315Vvxw_nrYyZQ','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','eNsBR5nTUbqZgW0JzQYBY','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','gV5Pdbxs5O1DABEVnyb57','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','1eJpl348zRLcRaHJ_UOpf','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','EYktZR73XPPhHEtfufNWC','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','KO07-qB9ijetC-IRL3hAK','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','jds6LoJtOps4RVLotRc7Q','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('-D7eLgFNVCGXbS6sFHxT5','W2bpVPegVLtZ00YHFeBZM','2026-12-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-09T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','b_NkXrejyGIIaZAQW6c7A','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','VhgwSw2jmAxr8Rb53Conl','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','yiwyv5a_bWUh_YLq3wV7_','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','MZjJiKbO-RGkvrvSMlyHZ','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','iShv18yQvprVcDvxCQmmA','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','w81mxy1iPJdxLYvE__HBk','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','PZ6BrVj315Vvxw_nrYyZQ','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','eNsBR5nTUbqZgW0JzQYBY','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','gV5Pdbxs5O1DABEVnyb57','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','1eJpl348zRLcRaHJ_UOpf','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','EYktZR73XPPhHEtfufNWC','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','KO07-qB9ijetC-IRL3hAK','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','jds6LoJtOps4RVLotRc7Q','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('AycNOr2kRijxOeqMKZp6N','W2bpVPegVLtZ00YHFeBZM','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-25T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-26T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','b_NkXrejyGIIaZAQW6c7A','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','VhgwSw2jmAxr8Rb53Conl','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','yiwyv5a_bWUh_YLq3wV7_','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','MZjJiKbO-RGkvrvSMlyHZ','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','iShv18yQvprVcDvxCQmmA','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','w81mxy1iPJdxLYvE__HBk','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','PZ6BrVj315Vvxw_nrYyZQ','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','eNsBR5nTUbqZgW0JzQYBY','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','gV5Pdbxs5O1DABEVnyb57','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','KO07-qB9ijetC-IRL3hAK','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','jds6LoJtOps4RVLotRc7Q','2026-11-27T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','2026-11-27T15:30:00.000Z');
CREATE TABLE `meeting_points` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_index` integer DEFAULT 0 NOT NULL, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meeting_points" VALUES('GoDGvIMazi_7OnUdXBWru','-D7eLgFNVCGXbS6sFHxT5','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('GxMriqDiVr6jkTXSynoWV','-D7eLgFNVCGXbS6sFHxT5','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('_Zow1JzGe_7vbiFFqFsoG','AycNOr2kRijxOeqMKZp6N','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('LtIWywVXMFl55An8Inxby','AycNOr2kRijxOeqMKZp6N','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('9T9Z2Lji1Jr9ng16oAI8e','UYLjQ2vfV0lUt6zpqB92I','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('yhNv4L5gUjy2WlWjffClt','UYLjQ2vfV0lUt6zpqB92I','Garden bench','Behind the kitchen, weather permitting.',1,1);
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
INSERT INTO "meetings" VALUES('w4_2iUPKrGohBcCX_86xZ','UYLjQ2vfV0lUt6zpqB92I','W2bpVPegVLtZ00YHFeBZM','A4MXoQcNzjViz8steJ9w3','2026-11-25T09:00:00.000Z','2026-11-25T09:30:00.000Z','Coffee bar','Container queries, and where they still bite.','accepted','2026-11-11T12:55:12.002Z','2026-11-11T12:55:12.002Z','');
INSERT INTO "meetings" VALUES('tZVTJM56e4dUOTVMGCJzk','UYLjQ2vfV0lUt6zpqB92I','1eJpl348zRLcRaHJ_UOpf','A4MXoQcNzjViz8steJ9w3','2026-11-25T09:00:00.000Z','2026-11-25T09:30:00.000Z','Garden bench','Could I steal you for the same half hour?','pending','2026-11-11T12:55:12.002Z',NULL,'');
INSERT INTO "meetings" VALUES('EJSWSdwZiOgS7-riopjWE','UYLjQ2vfV0lUt6zpqB92I','dhYAUZrm_UZ9ZVIt1Fc3I','A4MXoQcNzjViz8steJ9w3','2026-11-25T10:00:00.000Z','2026-11-25T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-11T12:55:12.002Z',NULL,'');
INSERT INTO "meetings" VALUES('kHrb_8oekP-r1jaV6dt4l','UYLjQ2vfV0lUt6zpqB92I','EYktZR73XPPhHEtfufNWC','A4MXoQcNzjViz8steJ9w3','2026-11-25T10:00:00.000Z','2026-11-25T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-11T12:55:12.002Z',NULL,'');
INSERT INTO "meetings" VALUES('cbKq62mf16YXvoO8gCv48','UYLjQ2vfV0lUt6zpqB92I','TqxaBp5UbN2fEbaEHW6gT','A4MXoQcNzjViz8steJ9w3','2026-11-25T10:00:00.000Z','2026-11-25T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-11T12:55:12.002Z',NULL,'');
INSERT INTO "meetings" VALUES('O5e97Iyv140BXCejkCX0M','UYLjQ2vfV0lUt6zpqB92I','A4MXoQcNzjViz8steJ9w3','KO07-qB9ijetC-IRL3hAK','2026-11-25T14:30:00.000Z','2026-11-25T15:00:00.000Z','Garden bench','Keen to hear how you run your platform team.','accepted','2026-11-11T12:55:12.002Z','2026-11-11T12:55:12.002Z','');
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
, `audience` text, `correlation_id` text, `command_key` text);
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
CREATE TABLE `idempotency_keys` (
	`actor` text NOT NULL,
	`key` text NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`body_hash` text NOT NULL,
	`status` integer,
	`headers` text,
	`body` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`actor`, `key`)
);
CREATE TABLE `login_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`event_id` text,
	`assurance` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`device` text, `via` text DEFAULT 'name' NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `bootstrap_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL
);
CREATE TABLE `join_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`event_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE "guests" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`about_me` text,
	`pronouns` text,
	`based_in` text,
	`prompts` text,
	`languages` text,
	`contacts` text,
	`email_on_rsvp_change` integer DEFAULT true NOT NULL,
	`email_on_host_change` integer DEFAULT true NOT NULL,
	`email_on_cohost_add` integer DEFAULT true NOT NULL,
	`email_on_proposal_join` integer DEFAULT true NOT NULL,
	`email_on_proposal_comment` integer DEFAULT true NOT NULL,
	`email_on_session_comment` integer DEFAULT true NOT NULL,
	`email_on_profile_comment` integer DEFAULT true NOT NULL,
	`email_on_comment_thread` integer DEFAULT false NOT NULL,
	`email_on_meeting_request` integer DEFAULT true NOT NULL,
	`email_on_meeting_response` integer DEFAULT true NOT NULL,
	`email_on_session_heads_up` integer DEFAULT true NOT NULL,
	`email_on_attendee_count_reminder` integer DEFAULT true NOT NULL,
	`avatar_url` text,
	`profile_updated_at` text,
	`auth_protected` integer DEFAULT false NOT NULL,
	`password_hash` text,
	`username` text,
	`password_set_at` text,
	`site_admin` integer DEFAULT false NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`profile_version` integer DEFAULT 1 NOT NULL
);
INSERT INTO "guests" VALUES('b_NkXrejyGIIaZAQW6c7A','Alice Test','alice@test.com','Frontend developer from Osaka. I love talking about **accessibility** and design systems — find me at the coffee machine.','She/Her','Osaka, Japan','[{"prompt":"Ask me about","answer":"Accessible design patterns and Japanese web typography"},{"prompt":"Offering","answer":"Code review swaps and coffee-machine debugging sessions"}]','["Japanese","English"]','[{"type":"website","value":"https://alice-test.example.com"},{"type":"telegram","value":"@alice_frontend"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/b_NkXrejyGIIaZAQW6c7A.webp?v=1794401710781','2026-11-11T09:55:10.781Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('DVNAWsooAkCOWvX1Sp0H1','Bob Test','bob@test.com','Product manager and community organizer from Lagos. I run a local meetup on inclusive product design and I''m always looking for speakers.','He/Him','Lagos, Nigeria','[{"prompt":"Looking for","answer":"Speakers for an inclusive product design meetup back home"},{"prompt":"Offering","answer":"Feedback on your product roadmap over coffee"}]','["English","Yoruba"]','[{"type":"email","value":"bob.organizes@example.com"},{"type":"whatsapp","value":"+234 801 234 5678"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/DVNAWsooAkCOWvX1Sp0H1.webp?v=1794401710782','2026-11-10T14:55:10.782Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('iAdjF-EtX27_ccwI2NVWN','Charlie Test','charlie@test.com','Data engineer from Guadalajara. Ask me about stream processing, or better yet, about my sourdough starter.','They/Them','Guadalajara, Mexico','[{"prompt":"Ask me about","answer":"Stream processing pipelines, or my sourdough starter"},{"prompt":"My weirdest skill","answer":"Naming Kafka topics that still make sense a year later"}]','["Spanish","English"]','[{"type":"discord","value":"charlie.streams"},{"type":"website","value":"https://charlie.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/iAdjF-EtX27_ccwI2NVWN.webp?v=1794401710783','2026-11-09T19:55:10.783Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('VhgwSw2jmAxr8Rb53Conl','Yuki Tanaka','yuki.tanaka@example.com',NULL,'He/Him',NULL,'[{"prompt":"Ask me about","answer":"Retro handheld consoles"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-09T00:55:10.783Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('Wk7lndCBEZJn1NY-SjFz0','Amara Okafor','amara.okafor@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('JsDO81PGk2jhFzQmo-2ud','Sofía Martínez','sofia.martinez@example.com',NULL,'She/Her',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-07T10:55:10.827Z',1,'scrypt$ebnqd5MOWlPb6tPN8B8xBg==$mUsxhvsuED3+benQTUH7SrHmmpw/xcyXUeqTKt9QQdw=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('yiwyv5a_bWUh_YLq3wV7_','Wei Chen','wei.chen@example.com','Platform engineer focused on developer experience.

Previously built CI tooling at a fintech startup in Shanghai. Ask me about `pipeline caching`.',NULL,'Shanghai, China','[{"prompt":"Ask me about","answer":"Build caching strategies that hold up under real CI load"}]','["Mandarin Chinese","English"]','[{"type":"telegram","value":"@weichen_dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/yiwyv5a_bWUh_YLq3wV7_.webp?v=1794401710784','2026-11-06T15:55:10.818Z',1,'scrypt$bPhWR1Ag1LfuuiiBHJn1+Q==$/WCoLNPYhRUqZcmdz89WhHvQdgraDyZYL97+KLsrT4I=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('wuMh9z-507W06D0wglsAg','Priya Sharma','priya.sharma@example.com','ML researcher from Bengaluru working on **fairness in recommendation systems**.

*First time at this conference* — say hi if you see me wandering around looking lost!','She/Her','Bengaluru, India','[{"prompt":"Ask me about","answer":"Fairness metrics for recommender systems"},{"prompt":"Looking for","answer":"A conference buddy — this is my first time here!"}]','["Hindi","Kannada","English"]','[{"type":"website","value":"https://priyasharma.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/wuMh9z-507W06D0wglsAg.webp?v=1794401710785','2026-11-05T20:55:10.785Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('Ocs_eOqCR0_EEXAuI55Fg','Lars Eriksson','lars.eriksson@example.com','Backend developer from Gothenburg. In rough order of enthusiasm:

- Rust
- saunas
- Kubernetes (reluctantly)','He/Him','Gothenburg, Sweden','[{"prompt":"Offering","answer":"Strong opinions about Rust, mild opinions about saunas"}]','["Swedish","English"]','[{"type":"signal","value":"lars.eriksson.99"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/Ocs_eOqCR0_EEXAuI55Fg.webp?v=1794401710786','2026-11-05T01:55:10.819Z',1,'scrypt$W466EUZ6CYFEMyjpIqf9qQ==$RVsF9rIWdWuqRBcPRcHZAhxrYnw5PmdA1RrajgejVAU=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('MZjJiKbO-RGkvrvSMlyHZ','Fatima Al-Farsi','fatima.alfarsi@example.com','Security engineer from Muscat. I break things *professionally* and fix them as a hobby. Happy to chat about threat modeling for small teams.',NULL,'Muscat, Oman','[{"prompt":"Ask me about","answer":"Threat modeling for teams too small to have a security hire"}]','["Arabic","English"]','[{"type":"email","value":"fatima.breaks.things@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/MZjJiKbO-RGkvrvSMlyHZ.webp?v=1794401710786','2026-11-04T06:55:10.820Z',1,'scrypt$wsa3pwdM5qPZYnwQoaKF3g==$PBHoQWbRxgdrze/kCsVRwS8qe7xRRHxqaOpaCL87Frs=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('awxf7QqL3cb4WvzT4C7PI','Kwame Mensah','kwame.mensah@example.com','Founder of a small agritech company in Accra. Interested in offline-first apps and building for low-bandwidth environments.','He/Him','Accra, Ghana','[{"prompt":"Offering","answer":"War stories about building for 2G networks"}]','["Twi","English"]','[{"type":"whatsapp","value":"+233 24 555 0187"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/awxf7QqL3cb4WvzT4C7PI.webp?v=1794401710787','2026-11-03T11:55:10.848Z',1,'scrypt$aCfLwk/tCjUL6Z6G3ALR0A==$Uqs55xgEXawS6kQvgrQtjVgDjSeV3+Wp7/qB56NyjK8=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('p7eh7GiHs_WQ0SmyqQ2rs','Hiroshi Yamamoto','hiroshi.yamamoto@example.com','Embedded systems engineer. I make LEDs blink for a living and I''m not ashamed of it.',NULL,'Yokohama, Japan','[{"prompt":"My weirdest skill","answer":"Debugging a blinking LED by ear"}]','["Japanese"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/p7eh7GiHs_WQ0SmyqQ2rs.webp?v=1794401710787','2026-11-02T16:55:10.848Z',1,'scrypt$zMLuFLMs2LVM6T2erw8moQ==$qWQ8ZAo4jzJTdEWhx3SSlPVjqbA+/v4i5fInbttuXN0=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('iShv18yQvprVcDvxCQmmA','Aisha Diallo','aisha.diallo@example.com','UX researcher from Dakar, currently based in Berlin. I care deeply about research ethics and multilingual interfaces.','She/Her','Berlin, Germany','[{"prompt":"Ask me about","answer":"Research ethics for multilingual user studies"}]','["French","Wolof","English","German"]','[{"type":"website","value":"https://aishadiallo.example.com"},{"type":"other","label":"Mastodon","value":"@aisha@ux.social"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/iShv18yQvprVcDvxCQmmA.webp?v=1794401710788','2026-11-01T21:55:10.848Z',1,'scrypt$XPSapsncS30lB5n/OvodHw==$ThLjtDimu++gd0rgQ0CIwdsghxxxfHlpbH46xxIUiUc=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('XNmy3ygsgvUjjnni0qsxe','Diego Fernández','diego.fernandez@example.com','Site reliability engineer from Buenos Aires. On-call survivor, incident retrospective enthusiast, tango dancer on weekends.',NULL,'Buenos Aires, Argentina','[{"prompt":"Offering","answer":"A rundown of the worst incident I ever caused, for entertainment purposes"}]','["Spanish","English"]','[{"type":"telegram","value":"@diego_sre"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/XNmy3ygsgvUjjnni0qsxe.webp?v=1794401710788','2026-11-01T02:55:10.856Z',1,'scrypt$J9CAsc6S/iHcxtdCwivTZA==$wW/yWOHFRcRBnHOeXR4+q5kCHti58a6ycvxSfXLGbp0=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('u_uY2Tj4Y3FV2i-A6PG9P','Mei-Ling Wu','meiling.wu@example.com','Technical writer from Taipei. I turn engineering mumbling into documentation people actually read.','She/Her','Taipei, Taiwan','[{"prompt":"Ask me about","answer":"Turning a wall of Slack threads into docs people read"}]','["Mandarin Chinese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/u_uY2Tj4Y3FV2i-A6PG9P.webp?v=1794401710788','2026-10-31T07:55:10.870Z',1,'scrypt$mY+ZzTs9pSAKpOCgtbFnAw==$FSb5rrcApCuWuU/RUQXMiWY1Eaf81z9MSOrzr9scEVg=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('w81mxy1iPJdxLYvE__HBk','Olga Petrova','olga.petrova@example.com','Database internals nerd. If your query is slow I want to hear about it in excruciating detail.',NULL,'Novosibirsk, Russia','[{"prompt":"Offering","answer":"A very detailed opinion about your slow query, whether you want it or not"}]','["Russian","English"]','[{"type":"email","value":"olga.petrova.db@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/w81mxy1iPJdxLYvE__HBk.webp?v=1794401710789','2026-10-30T12:55:10.871Z',1,'scrypt$OyAaJ/Widbbjp3GRxg4m2Q==$DTKl4T5kGxmn7uqxdespEyYyQ6/X+RaVX9ikqkN7KfY=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('Fd3gPLbxQVivweWTS2OYu','Jean-Pierre Dubois','jeanpierre.dubois@example.com','Engineering manager from Lyon. Interested in sustainable pace, team topologies, and where to find decent cheese near the venue.','He/Him','Lyon, France','[{"prompt":"Looking for","answer":"Cheese recommendations near the venue"}]','["French","English"]','[{"type":"whatsapp","value":"+33 6 12 34 56 78"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/Fd3gPLbxQVivweWTS2OYu.webp?v=1794401710789','2026-10-29T17:55:10.789Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('nwkMQXuSCjcT2u-kd5dLs','Thabo Ndlovu','thabo.ndlovu@example.com','Full-stack developer from Johannesburg working in civic tech. Building tools that help people navigate public services.',NULL,'Johannesburg, South Africa','[{"prompt":"Ask me about","answer":"Building civic tech that survives contact with real government data"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/nwkMQXuSCjcT2u-kd5dLs.webp?v=1794401710789','2026-10-28T22:55:10.789Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('PZ6BrVj315Vvxw_nrYyZQ','Anna Kowalska','anna.kowalska@example.com','QA engineer from Kraków. I find the bugs you swore were impossible.

Also: board game collector, **200+ and counting**.','She/Her','Kraków, Poland','[{"prompt":"Offering","answer":"Trades: I''ll find your worst bug for a board game recommendation"}]','["Polish","English"]','[{"type":"discord","value":"anna.qa"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/PZ6BrVj315Vvxw_nrYyZQ.webp?v=1794401710790','2026-10-28T03:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('7M832wmyr7fp7NiWF71Ux','Mohammed El-Sayed','mohammed.elsayed@example.com','Cloud architect from Cairo. Recovering microservices maximalist — ask me about the monolith we happily went back to.',NULL,'Cairo, Egypt','[{"prompt":"A hill I will die on","answer":"Boring architecture beats clever architecture, every time"}]','["Arabic","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/7M832wmyr7fp7NiWF71Ux.webp?v=1794401710790','2026-10-27T08:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('gHLNm3ONuzcyMnDClj73-','Isabella Rossi','isabella.rossi@example.com','Design lead from Milan. I bridge the gap between Figma and production, one design token at a time.','She/Her','Milan, Italy','[{"prompt":"Ask me about","answer":"Getting design tokens to survive contact with production"}]','["English","French"]','[{"type":"website","value":"https://isabellarossi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/gHLNm3ONuzcyMnDClj73-.webp?v=1794401710790','2026-10-26T13:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('eNsBR5nTUbqZgW0JzQYBY','Min-jun Kim','minjun.kim@example.com','Game developer from Seoul, moonlighting in web tech. Fascinated by real-time collaboration and CRDTs.','They/Them','Seoul, South Korea','[{"prompt":"Currently obsessed with","answer":"CRDTs, and why conflict-free replication is harder than it sounds"}]','["Korean","English"]','[{"type":"discord","value":"minjunkim"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/eNsBR5nTUbqZgW0JzQYBY.webp?v=1794401710790','2026-10-25T18:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('KkSNBDEU1KRxBUbvn4mS8','Carlos Silva','carlos.silva@example.com','DevOps engineer from Porto. I automate myself out of a job roughly once a year and somehow still have one.',NULL,'Porto, Portugal','[{"prompt":"Offering","answer":"A talk about automating yourself out of a job, repeatedly"}]','["Portuguese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/KkSNBDEU1KRxBUbvn4mS8.webp?v=1794401710790','2026-10-24T23:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('CxdYNzzd9zNg8WvWozhwl','Nadia Haddad','nadia.haddad@example.com','Mobile developer from Beirut. Flutter by day, native by necessity. Organizer of a local women-in-tech mentoring circle.','She/Her','Beirut, Lebanon','[{"prompt":"Looking for","answer":"Mentors and mentees for a women-in-tech circle back home"}]','["Arabic","French","English"]','[{"type":"other","label":"Instagram","value":"@nadia.builds"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-24T04:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('gV5Pdbxs5O1DABEVnyb57','Freya Nielsen','freya.nielsen@example.com','Accessibility consultant from Copenhagen. Screen reader power user. I will happily audit your conference talk slides.',NULL,'Copenhagen, Denmark','[{"prompt":"Offering","answer":"A free accessibility pass on your slides — bring your laptop"}]','["Danish","English"]','[{"type":"email","value":"freya.a11y@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-23T09:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('zUSsq4NQgbap_Ra7XRDVw','Arjun Nair','arjun.nair@example.com','Distributed systems engineer from Kochi. Currently obsessed with consensus protocols and filter coffee, in that order.','He/Him','Kochi, India','[{"prompt":"Currently obsessed with","answer":"Consensus protocols, and where filter coffee ranks among them"}]','["Malayalam","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-22T14:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('YeG2otpf2ApAtRzLip5fA','Elif Yılmaz','elif.yilmaz@example.com','Computer science student from Istanbul, here on a scholarship ticket. Excited about everything, please recommend me sessions!',NULL,'Istanbul, Turkey','[{"prompt":"Looking for","answer":"Session recommendations — I''m new here and excited about everything"}]','["Turkish","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-21T19:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('1eJpl348zRLcRaHJ_UOpf','Samuel Adeyemi','samuel.adeyemi@example.com','Backend engineer from Ibadan working on payment infrastructure across West Africa.',NULL,'Ibadan, Nigeria',NULL,'["Yoruba","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-21T00:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('TOdqxAjiJWhO61YMs4KIq','Linh Nguyen','linh.nguyen@example.com','Freelance web developer from Ho Chi Minh City. Jamstack fan, static site generator connoisseur, occasional conference speaker.','They/Them','Ho Chi Minh City, Vietnam','[{"prompt":"Offering","answer":"Static site generator recommendations, unsolicited and opinionated"}]','["Vietnamese","English"]','[{"type":"telegram","value":"@linh_jamstack"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-20T05:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('dhYAUZrm_UZ9ZVIt1Fc3I','Marta Horvat','marta.horvat@example.com','Agile coach from Zagreb. Yes, we can talk about whether estimates are worth it. No, we won''t agree.',NULL,'Zagreb, Croatia','[{"prompt":"A hill I will die on","answer":"Estimates are a communication tool, not a promise"}]','["Croatian","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-19T10:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('EYktZR73XPPhHEtfufNWC','Dmitri Volkov','dmitri.volkov@example.com','Compiler engineer. I read language specs for fun and I''m told this is concerning.',NULL,NULL,'[{"prompt":"My weirdest skill","answer":"Reading language specs for fun, apparently"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-18T15:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('TqxaBp5UbN2fEbaEHW6gT','Chiara Bianchi','chiara.bianchi@example.com','Data scientist from Bologna working in public health. Interested in reproducible research and open data.','She/Her','Bologna, Italy','[{"prompt":"Ask me about","answer":"Making public health research reproducible without a data team"}]',NULL,'[{"type":"website","value":"https://chiarabianchi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-17T20:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('A4MXoQcNzjViz8steJ9w3','Zanele Khumalo','zanele.khumalo@example.com','Frontend developer from Durban. CSS is my love language. Currently deep-diving into container queries.',NULL,'Durban, South Africa','[{"prompt":"Offering","answer":"Container query wizardry, upon request"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-17T01:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('KO07-qB9ijetC-IRL3hAK','Rafael Souza','rafael.souza@example.com','Engineering lead from São Paulo. I care about:

1. Mentoring junior devs
2. Building teams where questions are welcome
3. Coffee, not necessarily in that order',NULL,'São Paulo, Brazil','[{"prompt":"Offering","answer":"Mentoring conversations for junior devs finding their footing"}]','["Portuguese","English"]','[{"type":"website","value":"https://rafaelsouza.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-16T06:55:10.790Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('fFhh4S6EWUdJtR91qLZSB','Hana Kobayashi','hana.kobayashi@example.com','# Hi, I''m Hana!

Developer advocate based in Kyoto. I write tutorials, give talks, and collect conference stickers *competitively*.','She/Her','Kyoto, Japan','[{"prompt":"I collect","answer":"Conference stickers, competitively"}]','["Japanese","English"]','[{"type":"website","value":"https://hanakobayashi.example.com"},{"type":"other","label":"Bluesky","value":"@hanak.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/fFhh4S6EWUdJtR91qLZSB.webp?v=1794401710791','2026-10-15T11:55:10.791Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('iGkaKua4rLriedEAt_MZe','Tereza Nováková','tereza.novakova@example.com','Open source maintainer from Prague — see [my projects](https://github.example.com/tereza). Ask me about sustainable maintainership, or just send `git help`, either works.',NULL,'Prague, Czechia','[{"prompt":"Ask me about","answer":"Sustainable maintainership for projects that outlive their funding"}]','["Czech","English"]','[{"type":"website","value":"https://github.example.com/tereza"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-14T16:55:10.791Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('jds6LoJtOps4RVLotRc7Q','Ahmad Karimi','ahmad.karimi@example.com','Software engineer from Tehran, now in Amsterdam. Working on developer tooling and learning Dutch, slowly.','He/Him','Amsterdam, Netherlands','[{"prompt":"Currently obsessed with","answer":"Developer tooling, and slowly learning Dutch"}]','["Persian","Dutch","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-13T21:55:10.791Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('JHHtBOTwqPIYOez-GGyLp','Maria Papadopoulou','maria.papadopoulou@example.com','Tech lead from Thessaloniki. Legacy code whisperer. Strong opinions on testing, loosely held on everything else.',NULL,'Thessaloniki, Greece','[{"prompt":"Offering","answer":"Loosely held opinions on everything except testing"}]','["Greek","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-13T02:55:10.791Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('LKan9xhO4jTTKHoHxNxe_','Mateo Quispe','mateo.quispe@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('W2bpVPegVLtZ00YHFeBZM','Leilani Kahale','leilani.kahale@example.com',NULL,'She/They',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-11T12:55:10.791Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('Evm6mbn81YTanjg9i_IDy','Site Admin','site.admin@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,1,'scrypt$0FQSkqbcALPXTEEWhsxb1Q==$wtJuuSVC3TIn17MKmd4BYEqfPpgjIJvvNUeq627opt4=','site-admin',NULL,1,1,1);
CREATE UNIQUE INDEX `votes_proposal_guest_unique` ON `votes` (`proposal_id`,`guest_id`);
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);
CREATE UNIQUE INDEX `rsvps_session_guest_unique` ON `rsvps` (`session_id`,`guest_id`);
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
CREATE INDEX `idempotency_keys_created_at_idx` ON `idempotency_keys` (`created_at`);
CREATE INDEX `login_sessions_guest_idx` ON `login_sessions` (`guest_id`);
CREATE INDEX `login_sessions_expires_idx` ON `login_sessions` (`expires_at`);
CREATE UNIQUE INDEX `join_tokens_guest_event` ON `join_tokens` (`guest_id`,`event_id`);
CREATE INDEX `event_guests_guest_idx` ON `event_guests` (`guest_id`);
CREATE UNIQUE INDEX `guests_email_unique` ON `guests` (lower("email"));
CREATE UNIQUE INDEX `guests_username_unique` ON `guests` (`username`);
COMMIT;
