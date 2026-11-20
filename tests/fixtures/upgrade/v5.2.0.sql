-- Seeded database of schellingboard v5.2.0, dumped by
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
INSERT INTO "__drizzle_migrations" VALUES(NULL,'978d9526e4c294e4507a9afd21f7cfd6e5e19b32cf529eeb4b823c606afde7e6',1794234351960);
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
INSERT INTO "days" VALUES('2ggGfNEfKEdQIUurTZwTX','2027-01-01T08:00:00.000Z','2027-01-01T17:00:00.000Z','2027-01-01T08:00:00.000Z','2027-01-01T16:30:00.000Z','8VLwEf5j4Auj3qP8uWboU',1);
INSERT INTO "days" VALUES('JyTb7xqN3qwxBU8ea_nQE','2027-01-02T08:00:00.000Z','2027-01-02T17:00:00.000Z','2027-01-02T08:00:00.000Z','2027-01-02T16:30:00.000Z','8VLwEf5j4Auj3qP8uWboU',1);
INSERT INTO "days" VALUES('Egs_T19IUTodAGlfADihz','2027-01-03T08:00:00.000Z','2027-01-03T17:00:00.000Z','2027-01-03T08:00:00.000Z','2027-01-03T16:30:00.000Z','8VLwEf5j4Auj3qP8uWboU',1);
INSERT INTO "days" VALUES('ZY0WOufKNvOl8Nkq56dLX','2026-12-18T08:00:00.000Z','2026-12-18T17:00:00.000Z','2026-12-18T08:00:00.000Z','2026-12-18T16:30:00.000Z','4VuwmLxfL6ieouWsivJEG',1);
INSERT INTO "days" VALUES('8wI2YHu00PTeEJReT2tsV','2026-12-19T08:00:00.000Z','2026-12-19T17:00:00.000Z','2026-12-19T08:00:00.000Z','2026-12-19T16:30:00.000Z','4VuwmLxfL6ieouWsivJEG',1);
INSERT INTO "days" VALUES('YWkMDJSf-MOM-l3aBcdxt','2026-12-20T08:00:00.000Z','2026-12-20T17:00:00.000Z','2026-12-20T08:00:00.000Z','2026-12-20T16:30:00.000Z','4VuwmLxfL6ieouWsivJEG',1);
INSERT INTO "days" VALUES('dZRWyny0Zq_UAZXnJCtSA','2026-12-04T08:00:00.000Z','2026-12-04T17:00:00.000Z','2026-12-04T08:00:00.000Z','2026-12-04T16:30:00.000Z','foRApMDpSFp9dWQORjUxi',1);
INSERT INTO "days" VALUES('wb37rY8PpXy4rzbuZBC4J','2026-12-05T08:00:00.000Z','2026-12-05T17:00:00.000Z','2026-12-05T08:00:00.000Z','2026-12-05T16:30:00.000Z','foRApMDpSFp9dWQORjUxi',1);
INSERT INTO "days" VALUES('TsKW2GcnEXI64QNRGP_vo','2026-12-06T08:00:00.000Z','2026-12-07T02:00:00.000Z','2026-12-06T08:00:00.000Z','2026-12-07T01:30:00.000Z','foRApMDpSFp9dWQORjUxi',1);
CREATE TABLE "event_guests" (
	`event_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `guest_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','xadk-um1OLVQWW470yALm');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','hUXi67irZFzKskSGBzqIE');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','T_vMnJyje-liMbme_4Efb');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','JqQJB9R06rqD3wogvFy98');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "event_guests" VALUES('8VLwEf5j4Auj3qP8uWboU','B4wq1dYSQcArkKK0kO9AC');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','xadk-um1OLVQWW470yALm');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','hUXi67irZFzKskSGBzqIE');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','T_vMnJyje-liMbme_4Efb');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','JqQJB9R06rqD3wogvFy98');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "event_guests" VALUES('4VuwmLxfL6ieouWsivJEG','B4wq1dYSQcArkKK0kO9AC');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','xadk-um1OLVQWW470yALm');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','hUXi67irZFzKskSGBzqIE');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','T_vMnJyje-liMbme_4Efb');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','JqQJB9R06rqD3wogvFy98');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "event_guests" VALUES('foRApMDpSFp9dWQORjUxi','B4wq1dYSQcArkKK0kO9AC');
CREATE TABLE "event_locations" (
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `location_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-main-hall');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-room-a');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-room-b');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-library');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-boardroom');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-auditorium');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-courtyard');
INSERT INTO "event_locations" VALUES('8VLwEf5j4Auj3qP8uWboU','loc-rooftop');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-main-hall');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-room-a');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-room-b');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-library');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-boardroom');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-auditorium');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-courtyard');
INSERT INTO "event_locations" VALUES('4VuwmLxfL6ieouWsivJEG','loc-rooftop');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-main-hall');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-room-a');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-room-b');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-library');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-boardroom');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-auditorium');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-courtyard');
INSERT INTO "event_locations" VALUES('foRApMDpSFp9dWQORjUxi','loc-rooftop');
CREATE TABLE "proposal_hosts" (
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`proposal_id`, `guest_id`),
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_hosts" VALUES('clVCkL8I0Vk5YGXYd4gNr','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "proposal_hosts" VALUES('puuZsrEB3ZFyic9-8mYjw','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('yYw-pNFgiWOHedlRm92NH','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "proposal_hosts" VALUES('f-NOa7TCf4YUVaqeaDKSu','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "proposal_hosts" VALUES('f-NOa7TCf4YUVaqeaDKSu','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "proposal_hosts" VALUES('ebSm3Q4ozjmWAfRBJWml2','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "proposal_hosts" VALUES('ebSm3Q4ozjmWAfRBJWml2','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "proposal_hosts" VALUES('-MfuaDi47f7joKtksqK-b','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "proposal_hosts" VALUES('mA0gRIK6Ga08VZYkHXi_i','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "proposal_hosts" VALUES('t8AevmXuKTZY8HsuTDiWg','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "proposal_hosts" VALUES('D0f1w10xPMIX7yX3Cpf31','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('sYUuJSPjIUyfj54pVkNgv','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "proposal_hosts" VALUES('UCLEw11rVMP-jb6YFsMAF','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('eek3yeKswHoMU5q4MIZwn','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "proposal_hosts" VALUES('eek3yeKswHoMU5q4MIZwn','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "proposal_hosts" VALUES('rhB-guk1WoSA-QOQ9wnfT','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "proposal_hosts" VALUES('3gKE4i2lfatQJA4Q8rXgQ','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "proposal_hosts" VALUES('lQPYj6diifhr5cjHcRDGl','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "proposal_hosts" VALUES('zUoA-D9upaLYWBBF6Cmmu','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "proposal_hosts" VALUES('zUoA-D9upaLYWBBF6Cmmu','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "proposal_hosts" VALUES('UG_gPNA9sNmcbYIE63zO4','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "proposal_hosts" VALUES('K3OqG-su5_IxWujr441mE','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "proposal_hosts" VALUES('jGp9CQI73R1D2ilYPGVC9','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('7O5_6eR1lcHCtxSYUgWCX','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "proposal_hosts" VALUES('zdXf-wluM1eybC6hHmp8Q','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('wfN4EiqYDlGcpwoiyb6Gv','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "proposal_hosts" VALUES('F2egEnS2UMcrnXVaCvBxO','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "proposal_hosts" VALUES('Q44c6XXdPyHN0n0jHZuaT','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "proposal_hosts" VALUES('31AjqCtJGl6V24loAsoYx','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "proposal_hosts" VALUES('uC0luPhFpnhkJ7rsjolsR','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "proposal_hosts" VALUES('DAwFh6FR0NR0BNSXCzy7K','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "proposal_hosts" VALUES('lompyy4dfmUO3N1vCHTpI','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "proposal_hosts" VALUES('AXCjmtv06asHkXpI82hNu','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "proposal_hosts" VALUES('8rhOqtPVHgfnalTM1hYx6','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "proposal_hosts" VALUES('hxlFtu_R6mN2PxCo4UhWf','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "proposal_hosts" VALUES('SyxcIDrH3euzlwiZlpfjo','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "proposal_hosts" VALUES('jrJxUJToRW-iZmPZs6RIl','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "proposal_hosts" VALUES('unY7SfK1vT9qbpdmKAzx1','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "proposal_hosts" VALUES('hAnnqs7WweE28dDpwm4h5','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "proposal_hosts" VALUES('Odpn-eQJ9X3tKoUWx3HAh','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "proposal_hosts" VALUES('Odpn-eQJ9X3tKoUWx3HAh','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "proposal_hosts" VALUES('2sEzH27DcQ6kstyn1Gjny','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "proposal_hosts" VALUES('b__vtFYuRTJ8cJm0mn_vP','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "proposal_hosts" VALUES('j66WwaIyXuqRLD8i2n84f','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "proposal_hosts" VALUES('ji38S3aoglBOZc0aPwUSH','aVzBIlBaG-Y1BhSMk8zuy');
CREATE TABLE "rsvps" (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "rsvps" VALUES('pPDa4gtzUNJet2GebaEmF','LgNOFSCjrqHNnaOWryR0F','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('QjWIWj_wXiDuoLla-yIXi','KmoSJLHiE9zev6I5eaaoA','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('z_ju1JDkgkpn4hqmXx4Ko','2UeU_HlQwPOyzW5BHgQwH','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('ySzJQO1Q7fXqut7Vyd53l','5tMkZYMNzzMlhaMDLiNKc','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('Rrn2Uzq3c_OmKS2EdUA5N','7gsEuBv23DPkH4SEUxYl7','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('G7FUYz2elKRVDomyVIVsl','YFUv7A4FGIggnfGWzGQvB','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "rsvps" VALUES('oH0KrsHLyzOQqHLvn1Q2f','s8wCZOrTgPIa0w0reY3vq','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('GYgbh07JAzUbyRBue-ZUM','qtJYkVnjYL6zL__iFRatx','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('nTsLlIP2vGCylMhYUs6_t','U-ezQ4kayKG9G7URSSeV0','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('RWoYYR_ePJFhXq2vLbxVB','RUuVtpiD68iIomixc5fH2','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('aQb5LDvmAOrKd8aEpQLut','7gsEuBv23DPkH4SEUxYl7','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('2DrGj8_VFFNfua0CxBFT5','05WrtHQmlYNPYVQjrt-Ig','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "rsvps" VALUES('6L3JuFJ30nXoPumHCYAH_','2UeU_HlQwPOyzW5BHgQwH','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "rsvps" VALUES('DHVQ-do9Wjurw1eeZszsU','TUBFufFQGbU1Nx6-9enjn','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "rsvps" VALUES('CxeB3_d6EmrKmLGdqDbnG','fjeMDKAlU1KfClLbAWlKa','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "rsvps" VALUES('GC-5m0CE9u6RwX3H14Usy','YFUv7A4FGIggnfGWzGQvB','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "rsvps" VALUES('ekNbXofESaq3NJnkUIIwy','2UeU_HlQwPOyzW5BHgQwH','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "rsvps" VALUES('aZVroMWWVpeQJuHdaIDvg','U-ezQ4kayKG9G7URSSeV0','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "rsvps" VALUES('zGMHSOLL5Gjyc29O_qwtD','TUBFufFQGbU1Nx6-9enjn','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "rsvps" VALUES('7Y-yzCn7_m88oUrFT5mqY','E5Zd_vpO-1ZRBMY47po_6','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "rsvps" VALUES('nq8za9YEzvO-2c1I0XJaC','05WrtHQmlYNPYVQjrt-Ig','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "rsvps" VALUES('twJzzRgu6dOq3lV4Y-6af','LgNOFSCjrqHNnaOWryR0F','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "rsvps" VALUES('QXTlazV15O8e3a0f2rEUP','qtJYkVnjYL6zL__iFRatx','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "rsvps" VALUES('L3_FK5uzOPzhbSIm6bt59','CDGHJe5uMDYmMV04mqgLN','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "rsvps" VALUES('THfzHqrONiF1zzoWfeCQC','E5Zd_vpO-1ZRBMY47po_6','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "rsvps" VALUES('KOnWeeJ3Fn7NCItK9U9yY','2NyfTzZolQvpUYiYhBPCb','3CD4RABuWkAWuu2dgKnxs');
INSERT INTO "rsvps" VALUES('wB694ZCquLs9A1clT7Vz1','LgNOFSCjrqHNnaOWryR0F','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('25cE5nFI4UGBpxEvjsM5G','qtJYkVnjYL6zL__iFRatx','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('eR4Nd2c9hX_ZWkbWfurEi','U-ezQ4kayKG9G7URSSeV0','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('QMkjfjQzfAf1tUfS2OtvH','TUBFufFQGbU1Nx6-9enjn','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('vMFGHEYskQ47FUqToNZ_S','fjeMDKAlU1KfClLbAWlKa','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('eComWJ9gL48jJezH5q5yg','j80DFvceVL5TFSlogTa9w','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('c4HtU_OqUPG81_1p7ifPp','7gsEuBv23DPkH4SEUxYl7','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('tcfcGBSo8OQQYazyryP0W','05WrtHQmlYNPYVQjrt-Ig','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "rsvps" VALUES('Ryro2cE-DHnZp9cfyzZ69','LgNOFSCjrqHNnaOWryR0F','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('YjZknVGh2KEwJYNC0lk-B','2UeU_HlQwPOyzW5BHgQwH','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('kMlJeMx8ea1XpljO2ra8E','U-ezQ4kayKG9G7URSSeV0','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('8UL-5gJ3Tc39_QvollKon','j80DFvceVL5TFSlogTa9w','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('YEog0jYtkWl1Bz4KptzMs','RV_3ADNsluWJAB3Ok7fCR','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('Hmt5_LyZdiEmhRzXwm1pT','2NyfTzZolQvpUYiYhBPCb','fzuhG07KpzgjEWVvggiTq');
INSERT INTO "rsvps" VALUES('cCizwhM8Qw-ulKMBtoCCn','LgNOFSCjrqHNnaOWryR0F','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('P8ZBleJoZZ8tW4TcHvZZk','qtJYkVnjYL6zL__iFRatx','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('XpUKYUsTAf9SWe70HGo_w','CDGHJe5uMDYmMV04mqgLN','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('fA16lwsyR43myN7fwJaKm','5tMkZYMNzzMlhaMDLiNKc','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('X_ahXXlS9GFZXb-NpzjEm','7bpFGV6IqiXAWYkxTwPFV','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('koZEk-w3pOrtTZDeI1nKZ','YFUv7A4FGIggnfGWzGQvB','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "rsvps" VALUES('MIJwGQSu-jSxmEmXR4pKp','s8wCZOrTgPIa0w0reY3vq','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('ixovvT7fB-VL3LphK6Ele','qtJYkVnjYL6zL__iFRatx','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('D0FrKheLEp51BxVuZAsQo','CDGHJe5uMDYmMV04mqgLN','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('V-tynZzn5NYViFhNEV-PM','RUuVtpiD68iIomixc5fH2','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('QffMXx6_K-A8GagkpUBXQ','7bpFGV6IqiXAWYkxTwPFV','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('AihprVOmsivJOapH57p-2','YFUv7A4FGIggnfGWzGQvB','A-2D3WcMxIxHkgCX-Zg6I');
INSERT INTO "rsvps" VALUES('pdCRmaQnDt4lFiX5dKFfH','qtJYkVnjYL6zL__iFRatx','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "rsvps" VALUES('isww1M5U13uaPklgi4sv1','RUuVtpiD68iIomixc5fH2','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "rsvps" VALUES('E5FncWpOZ4mxi1WV1uu01','fjeMDKAlU1KfClLbAWlKa','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "rsvps" VALUES('TMGqzzNO-JiNF8NWF_-9x','7gsEuBv23DPkH4SEUxYl7','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "rsvps" VALUES('uXmz_LZIGJiDH4g8Oum_w','qtJYkVnjYL6zL__iFRatx','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('rHWHTIvalptgtBz8AJ5X0','U-ezQ4kayKG9G7URSSeV0','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('cRJiAJHWM7AnRweUOCVKK','RUuVtpiD68iIomixc5fH2','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('T9N9-UGTs5u0_WDY-oyze','5tMkZYMNzzMlhaMDLiNKc','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('65FmKHHcDv-uJ1qpXb4pv','7bpFGV6IqiXAWYkxTwPFV','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('s_zLREih18Jk3q8hZ08Pj','RV_3ADNsluWJAB3Ok7fCR','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('_x46S7dSw5VlNJzMl6Rj-','05WrtHQmlYNPYVQjrt-Ig','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "rsvps" VALUES('279bTbqhVCfudvwY39BC1','LgNOFSCjrqHNnaOWryR0F','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('10gOOk5udV21dxW6tmVmM','KmoSJLHiE9zev6I5eaaoA','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('Gpob5RgQa2hVZHoo5ogHM','TUBFufFQGbU1Nx6-9enjn','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('qCOAsOVhhtgJVht0cPQG8','fjeMDKAlU1KfClLbAWlKa','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('6_wGXmI-1TZCo4N9SgFjP','5tMkZYMNzzMlhaMDLiNKc','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('W5gFCLrZGeHdgunA8FeZg','2NyfTzZolQvpUYiYhBPCb','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('_bHQkXSRTN2l3ngPbOSRk','05WrtHQmlYNPYVQjrt-Ig','lmWswbXj1DPwV1PbJJrUs');
INSERT INTO "rsvps" VALUES('pOwo82zxr3ucgSdsV8iUr','LgNOFSCjrqHNnaOWryR0F','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "rsvps" VALUES('xMz47v8QW7zqZ5wJRPniO','qtJYkVnjYL6zL__iFRatx','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "rsvps" VALUES('DaUuKyHv2zCW14-imA2Sz','05WrtHQmlYNPYVQjrt-Ig','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "rsvps" VALUES('_ot59-BoqLfwGEBT5OUgy','LgNOFSCjrqHNnaOWryR0F','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "rsvps" VALUES('8VNWDRNnOHlnazLY8dK1O','RV_3ADNsluWJAB3Ok7fCR','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "rsvps" VALUES('lMxVpT6NsmkeP8zm1K6WU','YFUv7A4FGIggnfGWzGQvB','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "rsvps" VALUES('F4AfrdY8HPdZBflEbdDHF','LgNOFSCjrqHNnaOWryR0F','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('UTF6oMstqwTRZXIhRyIvR','qtJYkVnjYL6zL__iFRatx','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('SBZqndUnXsxZzeP3Xiu2A','RUuVtpiD68iIomixc5fH2','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('qa3j4PhH2IcK6IXo8s9YP','E5Zd_vpO-1ZRBMY47po_6','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('YDfPOrM8FiZUCBUh1gbQ1','5tMkZYMNzzMlhaMDLiNKc','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('yBrNJ2ZxqkhXooWmaLWOj','05WrtHQmlYNPYVQjrt-Ig','g2Y2MEU9ag9J28Tpr6eSe');
INSERT INTO "rsvps" VALUES('_oj2U62TYdZeFWUg1jGyV','fjeMDKAlU1KfClLbAWlKa','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "rsvps" VALUES('Vf4tFTS0LROUQSjyD9Qzl','5tMkZYMNzzMlhaMDLiNKc','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "rsvps" VALUES('lo4-wkHi_2QabeOu8z9nY','RV_3ADNsluWJAB3Ok7fCR','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "rsvps" VALUES('K_qjF81ZlIDUY0L8wY1ir','2NyfTzZolQvpUYiYhBPCb','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "rsvps" VALUES('fo8koToaOxWDy8kxvJWQ-','LgNOFSCjrqHNnaOWryR0F','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('GDTkh7G893KZrn_CKWoNJ','KmoSJLHiE9zev6I5eaaoA','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('RwEXKJICSdgBuW_q8W-vU','qtJYkVnjYL6zL__iFRatx','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('9KDKs46u_rVapYmy2JZGJ','TUBFufFQGbU1Nx6-9enjn','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('UKQ4N0Gv-jAe2ubzu54zT','j80DFvceVL5TFSlogTa9w','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('imZ-fHnrhmm9x8vr9tXPb','2NyfTzZolQvpUYiYhBPCb','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('cTWSw37SrEOUdI60aTn7W','05WrtHQmlYNPYVQjrt-Ig','xadk-um1OLVQWW470yALm');
INSERT INTO "rsvps" VALUES('Fz5A-eOvulxMQXfvmDhqw','LgNOFSCjrqHNnaOWryR0F','hUXi67irZFzKskSGBzqIE');
INSERT INTO "rsvps" VALUES('iQDECDehZ1WdL1dbhGyfG','KmoSJLHiE9zev6I5eaaoA','hUXi67irZFzKskSGBzqIE');
INSERT INTO "rsvps" VALUES('OdQM5nJ-znFIQ5WpNTgoX','7bpFGV6IqiXAWYkxTwPFV','hUXi67irZFzKskSGBzqIE');
INSERT INTO "rsvps" VALUES('wtzmvS6Q8kpKxfCAFMKt9','7gsEuBv23DPkH4SEUxYl7','hUXi67irZFzKskSGBzqIE');
INSERT INTO "rsvps" VALUES('A1xX_-ZMOwICpItolJAGM','LgNOFSCjrqHNnaOWryR0F','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('k5yar2wpbMMi9LiK-pVQV','KmoSJLHiE9zev6I5eaaoA','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('Aa1IVbvgyzSYnb2-wizft','CDGHJe5uMDYmMV04mqgLN','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('s0jFY-cF2vfdDXoj4xSZN','fjeMDKAlU1KfClLbAWlKa','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('LxFs9cb8sWEwVZLMJPlYG','7bpFGV6IqiXAWYkxTwPFV','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('Nyqr1Qwx0LZhRlcqrN1DI','RV_3ADNsluWJAB3Ok7fCR','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('7cqubc-ehjRI1mqcCnCmG','2NyfTzZolQvpUYiYhBPCb','FeIrMPprVHhS50rMvgVLd');
INSERT INTO "rsvps" VALUES('h4XShlREAt6PhYflyDIMy','KmoSJLHiE9zev6I5eaaoA','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('_PonvsDkmTXN10AGk0cjk','2UeU_HlQwPOyzW5BHgQwH','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('7V6qGq2iFnXXrz8n0Rs01','TUBFufFQGbU1Nx6-9enjn','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('tO2TsYfxKcc_inz5TRbtP','E5Zd_vpO-1ZRBMY47po_6','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('tIoeBqiml_B6OmrY95dr4','7gsEuBv23DPkH4SEUxYl7','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('KTT6dGdTxJyYX0S3xDsv6','YFUv7A4FGIggnfGWzGQvB','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('rkTfrP25STsVNsdkDyeQ3','05WrtHQmlYNPYVQjrt-Ig','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "rsvps" VALUES('_Ac16wAirnHXu5nHeAoP8','s8wCZOrTgPIa0w0reY3vq','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "rsvps" VALUES('LTAQBfENffuhwgMCnVnPT','TUBFufFQGbU1Nx6-9enjn','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "rsvps" VALUES('56gM3IT9ThSy2NPEq0Jnu','fjeMDKAlU1KfClLbAWlKa','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "rsvps" VALUES('hXrSwSnPLww5V10s9hev_','7bpFGV6IqiXAWYkxTwPFV','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "rsvps" VALUES('CYI6CMxHGgJgeLTSd8bLL','RV_3ADNsluWJAB3Ok7fCR','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "rsvps" VALUES('ySwNcyeLoqvhuIKLkHs1w','LgNOFSCjrqHNnaOWryR0F','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "rsvps" VALUES('HnDeL9rcaTVc2kXXlaieb','2UeU_HlQwPOyzW5BHgQwH','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "rsvps" VALUES('64tSRhwroqDwxlQAg-Bfw','E5Zd_vpO-1ZRBMY47po_6','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "rsvps" VALUES('nLMlp3lBnSHBhAISK57g0','RV_3ADNsluWJAB3Ok7fCR','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "rsvps" VALUES('bYG7RR5kPwChzmenCOKPx','05WrtHQmlYNPYVQjrt-Ig','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "rsvps" VALUES('TQJpOya36qbYMFpSkjn9e','KmoSJLHiE9zev6I5eaaoA','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "rsvps" VALUES('LFpNeJa4LkMSFUPNuSoJL','qtJYkVnjYL6zL__iFRatx','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "rsvps" VALUES('_wSWpEGA_5enobUYVVQww','TUBFufFQGbU1Nx6-9enjn','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "rsvps" VALUES('-uHIWznQtCpXviedZpFuc','2NyfTzZolQvpUYiYhBPCb','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "rsvps" VALUES('NLHxYqBOWgIh2s3u_uYKm','YFUv7A4FGIggnfGWzGQvB','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "rsvps" VALUES('G5wVDUfGVVtH4VNIh-vzs','KmoSJLHiE9zev6I5eaaoA','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('TS1RJeQTn8UYA_37142KY','2UeU_HlQwPOyzW5BHgQwH','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('YGktT6kpK5LtX7HyclMi8','CDGHJe5uMDYmMV04mqgLN','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('lUP_hE_hZUXpGOECmhLUp','5tMkZYMNzzMlhaMDLiNKc','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('kiB5q8OEnpdACrLLjLXcr','7bpFGV6IqiXAWYkxTwPFV','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('ke8qiGRKYA7-qr0_zmE7i','7gsEuBv23DPkH4SEUxYl7','B6LlBxVXBcCTj4yw_syvn');
INSERT INTO "rsvps" VALUES('NCmaUn0dfoHDjBCs3AaTN','LgNOFSCjrqHNnaOWryR0F','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('btLSV5T1pQ_edcQ8aL5JT','s8wCZOrTgPIa0w0reY3vq','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('LXT07kJZo6A876QhIjlng','TUBFufFQGbU1Nx6-9enjn','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('CcB6sGCT5Z5p54xvJ8iQ6','2NyfTzZolQvpUYiYhBPCb','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('pDCIXo2PVkkBLL5gEWFd3','YFUv7A4FGIggnfGWzGQvB','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('GGOGWRUxgBZXdGuogrhEo','05WrtHQmlYNPYVQjrt-Ig','joBV_Xbwxsri3Yx8LlPiH');
INSERT INTO "rsvps" VALUES('TjOS5d3hHSssiK1vrMNcl','s8wCZOrTgPIa0w0reY3vq','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('40vhUyLqMNwi4kCLcVV3c','qtJYkVnjYL6zL__iFRatx','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('J-NgYZrCIF3cvssx-vdEF','5tMkZYMNzzMlhaMDLiNKc','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('qaYhoiVvHUXNthOLv6l00','7bpFGV6IqiXAWYkxTwPFV','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('HsdkUiiR3QE1rrsBjFb0C','RV_3ADNsluWJAB3Ok7fCR','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('Bttfo1J8D6fTQpt8KTaNq','7gsEuBv23DPkH4SEUxYl7','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "rsvps" VALUES('WPwamNKXUJz8ICE4R2hnE','LgNOFSCjrqHNnaOWryR0F','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "rsvps" VALUES('NKeNB8h4WL8ahWT-u5bQk','s8wCZOrTgPIa0w0reY3vq','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "rsvps" VALUES('zuHC3R26xnFj52OE_oV66','TUBFufFQGbU1Nx6-9enjn','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "rsvps" VALUES('4KUOGQrwIUgfKV_sffjxq','E5Zd_vpO-1ZRBMY47po_6','71eYkQyF2gtMVzNEz4Ceg');
INSERT INTO "rsvps" VALUES('bUYYg_YjUFFQu1Zt_C4fb','TUBFufFQGbU1Nx6-9enjn','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "rsvps" VALUES('5A8s_9qa0-RuxuSG94wIu','5tMkZYMNzzMlhaMDLiNKc','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "rsvps" VALUES('gdrm5WJ0j7OQAMAa9KvXX','2NyfTzZolQvpUYiYhBPCb','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "rsvps" VALUES('09qKVOWWXoA_mVawtrouC','05WrtHQmlYNPYVQjrt-Ig','BS_eMdb5qYIj_yExay5QI');
INSERT INTO "rsvps" VALUES('6r9S1i1YNZXwlR8hZSOVD','LgNOFSCjrqHNnaOWryR0F','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('Lf1b3kPxeTqkwsmttXTHS','TUBFufFQGbU1Nx6-9enjn','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('dwzE2ZNIU48jKOn3dLnwu','E5Zd_vpO-1ZRBMY47po_6','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('k7F2-Kd2-02FIkfSUZ0Il','j80DFvceVL5TFSlogTa9w','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('kDZsAqUoZ5tqCA96PRd_v','7bpFGV6IqiXAWYkxTwPFV','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('aKZdPdSJaFxfy94SFT5Wp','YFUv7A4FGIggnfGWzGQvB','T_vMnJyje-liMbme_4Efb');
INSERT INTO "rsvps" VALUES('Gb4qT0iAJQa98N22JFHRY','LgNOFSCjrqHNnaOWryR0F','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "rsvps" VALUES('1V0AAeZVHI7B8lIKvp8xl','s8wCZOrTgPIa0w0reY3vq','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "rsvps" VALUES('oa80ONm2X0Lw5fbxG8vHv','2UeU_HlQwPOyzW5BHgQwH','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "rsvps" VALUES('RmfWYGn11_627v05NYu0L','E5Zd_vpO-1ZRBMY47po_6','pccefhg_NrlvJHuVUIFHm');
INSERT INTO "rsvps" VALUES('Fz1cAomwe28qsBV7Q5ljG','qtJYkVnjYL6zL__iFRatx','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "rsvps" VALUES('xfmZSgNzfyVF-jUxhAfSy','U-ezQ4kayKG9G7URSSeV0','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "rsvps" VALUES('Jk4FjA6CI8_bKO_O7gO8U','TUBFufFQGbU1Nx6-9enjn','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "rsvps" VALUES('ClnTE1SsTlaYhCqbcBbt0','fjeMDKAlU1KfClLbAWlKa','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "rsvps" VALUES('JUg_aXe-y2GfOFwWBIVmw','05WrtHQmlYNPYVQjrt-Ig','7_z70nuNqFlZXFLA76Ift');
INSERT INTO "rsvps" VALUES('MZvAc5xfAJrayKukj8PBD','KmoSJLHiE9zev6I5eaaoA','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "rsvps" VALUES('BUXTWcQ3xUgTYA_Z_MywL','E5Zd_vpO-1ZRBMY47po_6','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "rsvps" VALUES('SRuMPiMVG87aijgODYWXN','7bpFGV6IqiXAWYkxTwPFV','WSSlq8biti-tqLOLCyJwc');
INSERT INTO "rsvps" VALUES('Y1-VGR-uH7r3_2L136D_h','LgNOFSCjrqHNnaOWryR0F','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "rsvps" VALUES('3aWcEqeyqAiftY7oqLgG8','qtJYkVnjYL6zL__iFRatx','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "rsvps" VALUES('qWsvcj9veZGOhKthoavxu','fjeMDKAlU1KfClLbAWlKa','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "rsvps" VALUES('itKKcyRRPRy3eBfdSVf9M','05WrtHQmlYNPYVQjrt-Ig','a17N0EkVvIliYoDwqyKG7');
INSERT INTO "rsvps" VALUES('czqliOQr8e52IzBYhkVMX','LgNOFSCjrqHNnaOWryR0F','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "rsvps" VALUES('w4RuFg6k-AqQ4mayRHMbg','KmoSJLHiE9zev6I5eaaoA','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "rsvps" VALUES('aKVBplq0ez3WVlBuqkYf7','CDGHJe5uMDYmMV04mqgLN','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "rsvps" VALUES('bV0_US8eTmZ1VA2_i2L0B','KmoSJLHiE9zev6I5eaaoA','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('aei0145taBC5oQT9Etc6G','CDGHJe5uMDYmMV04mqgLN','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('wrqN_BnL0OBPBpX9LcgJQ','RUuVtpiD68iIomixc5fH2','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('HgCIHZslwTN-pDTV2sgnL','fjeMDKAlU1KfClLbAWlKa','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('0f6jps7tpu55qSWnRN1TN','j80DFvceVL5TFSlogTa9w','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('9grnqoS24sNIg4zx6FYAE','05WrtHQmlYNPYVQjrt-Ig','uGj9-HQqb3vnIv_juOw-C');
INSERT INTO "rsvps" VALUES('QqsJmkCr6dG4cUy46hte9','LgNOFSCjrqHNnaOWryR0F','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "rsvps" VALUES('NEd7c_KxxkFrz6qgA0FkH','CDGHJe5uMDYmMV04mqgLN','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "rsvps" VALUES('0JxzQyycRs9ag8QXlkpdn','fjeMDKAlU1KfClLbAWlKa','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "rsvps" VALUES('Fwwxd-fnEpGrU2ejkFDoX','j80DFvceVL5TFSlogTa9w','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "rsvps" VALUES('InI4pv1Q_gve7ZlwvXtLr','7bpFGV6IqiXAWYkxTwPFV','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "rsvps" VALUES('H6pf0_qM8i4gV3eQt4ZEp','qtJYkVnjYL6zL__iFRatx','upEogf7diAZmjg-LBwFxb');
INSERT INTO "rsvps" VALUES('_5M3In2EEZxyUPIN2cipA','TUBFufFQGbU1Nx6-9enjn','upEogf7diAZmjg-LBwFxb');
INSERT INTO "rsvps" VALUES('ER525cZRrp8c_8CMV1BAG','E5Zd_vpO-1ZRBMY47po_6','upEogf7diAZmjg-LBwFxb');
INSERT INTO "rsvps" VALUES('RGMs1-tbpOoMP5gBEW0kz','2NyfTzZolQvpUYiYhBPCb','upEogf7diAZmjg-LBwFxb');
INSERT INTO "rsvps" VALUES('R-Q3IArS9VEbHXmZzj84I','05WrtHQmlYNPYVQjrt-Ig','upEogf7diAZmjg-LBwFxb');
INSERT INTO "rsvps" VALUES('YbMoqn6WraLz4FF8e6_nF','KmoSJLHiE9zev6I5eaaoA','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "rsvps" VALUES('q00R1S0DebP7xfhIbyehV','2UeU_HlQwPOyzW5BHgQwH','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "rsvps" VALUES('zoxBf4QD171epWB_NCDey','CDGHJe5uMDYmMV04mqgLN','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "rsvps" VALUES('6DcnMq-mvBY-kQVjO_YPc','TUBFufFQGbU1Nx6-9enjn','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "rsvps" VALUES('dgx5allpRW3OSv55lYcKw','05WrtHQmlYNPYVQjrt-Ig','X61pP6MpXPqB5bmJnR8OR');
INSERT INTO "rsvps" VALUES('zXs0mim0LTA9Dx_Q3H5tP','LgNOFSCjrqHNnaOWryR0F','JqQJB9R06rqD3wogvFy98');
INSERT INTO "rsvps" VALUES('rz-EMwkQR6hbvUOGpaqto','CDGHJe5uMDYmMV04mqgLN','JqQJB9R06rqD3wogvFy98');
INSERT INTO "rsvps" VALUES('ApFCvhF6lDhFzlAQGlwqi','RUuVtpiD68iIomixc5fH2','JqQJB9R06rqD3wogvFy98');
INSERT INTO "rsvps" VALUES('93ZbH0l-iO_DC5tVEu4MR','2NyfTzZolQvpUYiYhBPCb','JqQJB9R06rqD3wogvFy98');
INSERT INTO "rsvps" VALUES('9l4ZWczji2oulrnZ3mj8j','LgNOFSCjrqHNnaOWryR0F','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('IJ4PWMHnDoKWEUACYGPbh','qtJYkVnjYL6zL__iFRatx','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('4LpdGnvbVfNuOvxGE6mbU','U-ezQ4kayKG9G7URSSeV0','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('aWvd29EkBkiKjU409nxqh','RUuVtpiD68iIomixc5fH2','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('ZPDG0R8kyGJu9APv2RmyX','5tMkZYMNzzMlhaMDLiNKc','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('aj6KtS-rLH2LhC9MNO5f1','7bpFGV6IqiXAWYkxTwPFV','YI7OKPnMbvhYn_vWxCj3o');
INSERT INTO "rsvps" VALUES('zaQGZ5-Be7eqJjXhn1kEp','2NyfTzZolQvpUYiYhBPCb','YI7OKPnMbvhYn_vWxCj3o');
CREATE TABLE "session_hosts" (
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `guest_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_hosts" VALUES('T54QA-Bf2h8t3s2QstVIE','qYrnpWvEbqovxJrU7-bLc');
INSERT INTO "session_hosts" VALUES('_ux43f25TE2LrYAkPv8Fw','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "session_hosts" VALUES('LgNOFSCjrqHNnaOWryR0F','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "session_hosts" VALUES('KmoSJLHiE9zev6I5eaaoA','4m-IDZiT3aoidhMR42Rnf');
INSERT INTO "session_hosts" VALUES('s8wCZOrTgPIa0w0reY3vq','J4_Hfv_cYWR5PtJ2-fjB6');
INSERT INTO "session_hosts" VALUES('qtJYkVnjYL6zL__iFRatx','nbvsqreGd-qltpMrQMgUj');
INSERT INTO "session_hosts" VALUES('2UeU_HlQwPOyzW5BHgQwH','NPO7h8xslD0uHfUC_Edb0');
INSERT INTO "session_hosts" VALUES('CDGHJe5uMDYmMV04mqgLN','bFc2AxCyHQ5JmK0AOC-3k');
INSERT INTO "session_hosts" VALUES('U-ezQ4kayKG9G7URSSeV0','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "session_hosts" VALUES('TUBFufFQGbU1Nx6-9enjn','65nHCLlKwYqVTPhyJbvb0');
INSERT INTO "session_hosts" VALUES('RUuVtpiD68iIomixc5fH2','LqMrw2W4Q8rtgz6hOrr_h');
INSERT INTO "session_hosts" VALUES('E5Zd_vpO-1ZRBMY47po_6','r2qBH1bBxh_WZFMnmpCem');
INSERT INTO "session_hosts" VALUES('fjeMDKAlU1KfClLbAWlKa','jFXpawOxJ84YUQ1QeUdax');
INSERT INTO "session_hosts" VALUES('j80DFvceVL5TFSlogTa9w','ZR_N3BysPeGSmkw1Sc6As');
INSERT INTO "session_hosts" VALUES('j80DFvceVL5TFSlogTa9w','MuPXEoJa6zGQGTXZpqSLf');
INSERT INTO "session_hosts" VALUES('5tMkZYMNzzMlhaMDLiNKc','q1J2GxzP0jcxIVSUeNEW8');
INSERT INTO "session_hosts" VALUES('7bpFGV6IqiXAWYkxTwPFV','raOZ1cf9LCGm03lv8SNBl');
INSERT INTO "session_hosts" VALUES('RV_3ADNsluWJAB3Ok7fCR','KyxxptSs-hAFIaAIBYwqo');
INSERT INTO "session_hosts" VALUES('2NyfTzZolQvpUYiYhBPCb','xaIzAJf0ygp2RH0x9Q0a9');
INSERT INTO "session_hosts" VALUES('7gsEuBv23DPkH4SEUxYl7','fR7_6ZapXcBdI1nhPgQdJ');
INSERT INTO "session_hosts" VALUES('YFUv7A4FGIggnfGWzGQvB','aVzBIlBaG-Y1BhSMk8zuy');
INSERT INTO "session_hosts" VALUES('05WrtHQmlYNPYVQjrt-Ig','raOZ1cf9LCGm03lv8SNBl');
CREATE TABLE "session_locations" (
	`session_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `location_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_locations" VALUES('T54QA-Bf2h8t3s2QstVIE','loc-main-hall');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-main-hall');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-room-a');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-room-b');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-library');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-boardroom');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-auditorium');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-courtyard');
INSERT INTO "session_locations" VALUES('wLZPjJoxV5Vu4qlEbjglC','loc-rooftop');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-main-hall');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-room-a');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-room-b');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-library');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-boardroom');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-auditorium');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-courtyard');
INSERT INTO "session_locations" VALUES('Nh6OzLf_FYyo6A3AhozYL','loc-rooftop');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-main-hall');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-room-a');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-room-b');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-library');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-boardroom');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-auditorium');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-courtyard');
INSERT INTO "session_locations" VALUES('Exi7tBFl1yBUZcDRNObxi','loc-rooftop');
INSERT INTO "session_locations" VALUES('_ux43f25TE2LrYAkPv8Fw','loc-main-hall');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-main-hall');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-room-a');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-room-b');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-library');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-boardroom');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-auditorium');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-courtyard');
INSERT INTO "session_locations" VALUES('mxV3Pmxhtr-SiTlAWxe14','loc-rooftop');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-main-hall');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-room-a');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-room-b');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-library');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-boardroom');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-auditorium');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-courtyard');
INSERT INTO "session_locations" VALUES('1WW_zjyQEQMNpQtZI1Fvo','loc-rooftop');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-main-hall');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-room-a');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-room-b');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-library');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-boardroom');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-auditorium');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-courtyard');
INSERT INTO "session_locations" VALUES('rYODcgmySq5uEN2kw6-ve','loc-rooftop');
INSERT INTO "session_locations" VALUES('LgNOFSCjrqHNnaOWryR0F','loc-main-hall');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-main-hall');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-room-a');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-room-b');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-library');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-boardroom');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-auditorium');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-courtyard');
INSERT INTO "session_locations" VALUES('i5AoZz7kj70-i2WskWIq_','loc-rooftop');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-main-hall');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-room-a');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-room-b');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-library');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-boardroom');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-auditorium');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-courtyard');
INSERT INTO "session_locations" VALUES('uGrGreeYwDpBl6gQVmYWh','loc-rooftop');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-main-hall');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-room-a');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-room-b');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-library');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-boardroom');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-auditorium');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-courtyard');
INSERT INTO "session_locations" VALUES('vwNAZUQECK2zLKA-JOnCf','loc-rooftop');
INSERT INTO "session_locations" VALUES('KmoSJLHiE9zev6I5eaaoA','loc-main-hall');
INSERT INTO "session_locations" VALUES('s8wCZOrTgPIa0w0reY3vq','loc-room-a');
INSERT INTO "session_locations" VALUES('qtJYkVnjYL6zL__iFRatx','loc-main-hall');
INSERT INTO "session_locations" VALUES('2UeU_HlQwPOyzW5BHgQwH','loc-room-b');
INSERT INTO "session_locations" VALUES('CDGHJe5uMDYmMV04mqgLN','loc-room-a');
INSERT INTO "session_locations" VALUES('U-ezQ4kayKG9G7URSSeV0','loc-main-hall');
INSERT INTO "session_locations" VALUES('TUBFufFQGbU1Nx6-9enjn','loc-room-b');
INSERT INTO "session_locations" VALUES('RUuVtpiD68iIomixc5fH2','loc-room-a');
INSERT INTO "session_locations" VALUES('E5Zd_vpO-1ZRBMY47po_6','loc-main-hall');
INSERT INTO "session_locations" VALUES('E5Zd_vpO-1ZRBMY47po_6','loc-auditorium');
INSERT INTO "session_locations" VALUES('fjeMDKAlU1KfClLbAWlKa','loc-room-b');
INSERT INTO "session_locations" VALUES('j80DFvceVL5TFSlogTa9w','loc-main-hall');
INSERT INTO "session_locations" VALUES('5tMkZYMNzzMlhaMDLiNKc','loc-room-b');
INSERT INTO "session_locations" VALUES('7bpFGV6IqiXAWYkxTwPFV','loc-main-hall');
INSERT INTO "session_locations" VALUES('7bpFGV6IqiXAWYkxTwPFV','loc-auditorium');
INSERT INTO "session_locations" VALUES('RV_3ADNsluWJAB3Ok7fCR','loc-main-hall');
INSERT INTO "session_locations" VALUES('2NyfTzZolQvpUYiYhBPCb','loc-room-a');
INSERT INTO "session_locations" VALUES('7gsEuBv23DPkH4SEUxYl7','loc-room-b');
INSERT INTO "session_locations" VALUES('YFUv7A4FGIggnfGWzGQvB','loc-main-hall');
INSERT INTO "session_locations" VALUES('05WrtHQmlYNPYVQjrt-Ig','loc-main-hall');
CREATE TABLE "session_proposals" (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer,
	`created_time` text NOT NULL, `updated_time` text, `cohost_wanted` integer DEFAULT false NOT NULL, `cohost_wanted_note` text, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_proposals" VALUES('clVCkL8I0Vk5YGXYd4gNr','8VLwEf5j4Auj3qP8uWboU','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',30,'2026-11-20T12:08:34.707Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('QWXOH2bqDM8OtOocr9sDD','8VLwEf5j4Auj3qP8uWboU','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',NULL,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('puuZsrEB3ZFyic9-8mYjw','8VLwEf5j4Auj3qP8uWboU','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',150,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('yYw-pNFgiWOHedlRm92NH','8VLwEf5j4Auj3qP8uWboU','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',90,'2026-11-20T12:08:34.707Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('f-NOa7TCf4YUVaqeaDKSu','8VLwEf5j4Auj3qP8uWboU','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ebSm3Q4ozjmWAfRBJWml2','8VLwEf5j4Auj3qP8uWboU','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-20T12:08:34.707Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('pGx_2eZ4JE5SsOuDSPBwM','8VLwEf5j4Auj3qP8uWboU','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('-MfuaDi47f7joKtksqK-b','8VLwEf5j4Auj3qP8uWboU','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',120,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('mA0gRIK6Ga08VZYkHXi_i','8VLwEf5j4Auj3qP8uWboU','Conference Alpha Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Alpha attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('t8AevmXuKTZY8HsuTDiWg','8VLwEf5j4Auj3qP8uWboU','Networking & Coffee Chat: Connect with Conference Alpha Peers','An informal networking session designed to help Conference Alpha attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('D0f1w10xPMIX7yX3Cpf31','8VLwEf5j4Auj3qP8uWboU','Conference Alpha Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Alpha community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('sYUuJSPjIUyfj54pVkNgv','4VuwmLxfL6ieouWsivJEG','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-20T12:08:34.707Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('UCLEw11rVMP-jb6YFsMAF','4VuwmLxfL6ieouWsivJEG','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',150,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('4n_lh6jyZiq7SoYmKPV9e','4VuwmLxfL6ieouWsivJEG','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('eek3yeKswHoMU5q4MIZwn','4VuwmLxfL6ieouWsivJEG','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-20T12:08:34.707Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('rhB-guk1WoSA-QOQ9wnfT','4VuwmLxfL6ieouWsivJEG','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',150,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('3gKE4i2lfatQJA4Q8rXgQ','4VuwmLxfL6ieouWsivJEG','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-20T12:08:34.707Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('lQPYj6diifhr5cjHcRDGl','4VuwmLxfL6ieouWsivJEG','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('zUoA-D9upaLYWBBF6Cmmu','4VuwmLxfL6ieouWsivJEG','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('UG_gPNA9sNmcbYIE63zO4','4VuwmLxfL6ieouWsivJEG','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('tZWX1Od_o57yKLy5yv014','4VuwmLxfL6ieouWsivJEG','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('K3OqG-su5_IxWujr441mE','4VuwmLxfL6ieouWsivJEG','Conference Beta Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Beta attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('jGp9CQI73R1D2ilYPGVC9','4VuwmLxfL6ieouWsivJEG','Networking & Coffee Chat: Connect with Conference Beta Peers','An informal networking session designed to help Conference Beta attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('7O5_6eR1lcHCtxSYUgWCX','4VuwmLxfL6ieouWsivJEG','Conference Beta Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Beta community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('hxlFtu_R6mN2PxCo4UhWf','foRApMDpSFp9dWQORjUxi','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-20T12:08:34.707Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('uC0luPhFpnhkJ7rsjolsR','foRApMDpSFp9dWQORjUxi','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('DAwFh6FR0NR0BNSXCzy7K','foRApMDpSFp9dWQORjUxi','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('lompyy4dfmUO3N1vCHTpI','foRApMDpSFp9dWQORjUxi','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-20T12:08:34.707Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('ji38S3aoglBOZc0aPwUSH','foRApMDpSFp9dWQORjUxi','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('2sEzH27DcQ6kstyn1Gjny','foRApMDpSFp9dWQORjUxi','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',60,'2026-11-20T12:08:34.707Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('hAnnqs7WweE28dDpwm4h5','foRApMDpSFp9dWQORjUxi','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Odpn-eQJ9X3tKoUWx3HAh','foRApMDpSFp9dWQORjUxi','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('8rhOqtPVHgfnalTM1hYx6','foRApMDpSFp9dWQORjUxi','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('SyxcIDrH3euzlwiZlpfjo','foRApMDpSFp9dWQORjUxi','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('b__vtFYuRTJ8cJm0mn_vP','foRApMDpSFp9dWQORjUxi','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('jrJxUJToRW-iZmPZs6RIl','foRApMDpSFp9dWQORjUxi','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('AXCjmtv06asHkXpI82hNu','foRApMDpSFp9dWQORjUxi','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('j66WwaIyXuqRLD8i2n84f','foRApMDpSFp9dWQORjUxi','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('unY7SfK1vT9qbpdmKAzx1','foRApMDpSFp9dWQORjUxi','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('zdXf-wluM1eybC6hHmp8Q','foRApMDpSFp9dWQORjUxi','Conference Gamma Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Conference Gamma attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('wfN4EiqYDlGcpwoiyb6Gv','foRApMDpSFp9dWQORjUxi','Networking & Coffee Chat: Connect with Conference Gamma Peers','An informal networking session designed to help Conference Gamma attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('F2egEnS2UMcrnXVaCvBxO','foRApMDpSFp9dWQORjUxi','Conference Gamma Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Conference Gamma community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Q44c6XXdPyHN0n0jHZuaT','foRApMDpSFp9dWQORjUxi','Writing Documentation People Actually Read','Most documentation is written once, in a hurry, by whoever shipped the feature. This session is about the opposite: treating docs as a product with readers, a first minute that has to land, and a maintenance cost you plan for.

We''ll look at real examples — a few good, several painfully bad — and pull out what separates them: task-shaped titles, examples before explanations, and the courage to delete a page.

Bring a page you''re unhappy with and we''ll rework it together.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('31AjqCtJGl6V24loAsoYx','foRApMDpSFp9dWQORjUxi','Your First Conference Talk: From Idea to Stage','You have something worth saying and no idea how to turn it into 30 minutes on a stage. Let''s fix that.

We''ll cover finding a topic that''s genuinely yours, writing an abstract that survives a review committee, building slides that support you instead of competing with you, and what to do when your demo dies in front of 200 people (it will, eventually).

Aimed at people who have *never* spoken before. No slides of my own — we work on yours.',90,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('3mH4jHlQFsffmSkAHe8DC','foRApMDpSFp9dWQORjUxi','Ask Me Anything: Migrating a Legacy Monolith','**Looking for someone to host this!**

Several of us are staring down the same problem: a monolith that works, pays the bills, and is slowly becoming impossible to change. We''d love to hear from somebody who has actually come out the other side of a migration — what you''d do again, and what you''d never repeat.

If you''ve lived through one, please add yourself as host. An honest hour of war stories beats a polished talk.',60,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('XtMzz15sjim3vRCLv4c9y','foRApMDpSFp9dWQORjUxi','Board Games for People Who Are Tired of Talking','By day three, everyone''s social battery is empty. This is a quiet room with a table, a stack of games, and no agenda.

Nobody has volunteered to bring the games yet — if you''re travelling with something short and easy to teach, add yourself as host and we''ll make it happen.',120,'2026-11-20T12:08:34.707Z',NULL,0,NULL,1);
CREATE TABLE "votes" (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`choice` text NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "votes" VALUES('85HcLfps3NxiNwyYd5Msc','sYUuJSPjIUyfj54pVkNgv','qYrnpWvEbqovxJrU7-bLc','maybe');
INSERT INTO "votes" VALUES('qJ3mZoPXSCTwaewS-mvta','eek3yeKswHoMU5q4MIZwn','qYrnpWvEbqovxJrU7-bLc','interested');
INSERT INTO "votes" VALUES('G5BK-n6rR3bO0449Ytpeq','3gKE4i2lfatQJA4Q8rXgQ','qYrnpWvEbqovxJrU7-bLc','maybe');
INSERT INTO "votes" VALUES('zotN3jps8gAYmI-QBYvlt','lQPYj6diifhr5cjHcRDGl','qYrnpWvEbqovxJrU7-bLc','maybe');
INSERT INTO "votes" VALUES('TUa8uemXmnpw64I1lDE4x','UG_gPNA9sNmcbYIE63zO4','qYrnpWvEbqovxJrU7-bLc','interested');
INSERT INTO "votes" VALUES('6vAFP9bEjIJHn5C3L5D04','tZWX1Od_o57yKLy5yv014','qYrnpWvEbqovxJrU7-bLc','skip');
INSERT INTO "votes" VALUES('OoQspBrXuJFCmVdn9-n9t','UCLEw11rVMP-jb6YFsMAF','ZR_N3BysPeGSmkw1Sc6As','maybe');
INSERT INTO "votes" VALUES('JfWoa20t8l2rjDdBoGsCf','eek3yeKswHoMU5q4MIZwn','ZR_N3BysPeGSmkw1Sc6As','interested');
INSERT INTO "votes" VALUES('EhF9EMcczYb6r3h_2AKit','rhB-guk1WoSA-QOQ9wnfT','ZR_N3BysPeGSmkw1Sc6As','skip');
INSERT INTO "votes" VALUES('meAesCxUadKOIYE-KkdHg','UG_gPNA9sNmcbYIE63zO4','ZR_N3BysPeGSmkw1Sc6As','maybe');
INSERT INTO "votes" VALUES('4erJDG95KS0D9DUR3C2Tj','rhB-guk1WoSA-QOQ9wnfT','raOZ1cf9LCGm03lv8SNBl','maybe');
INSERT INTO "votes" VALUES('AEpzcNGihoovfHPxZv-aH','3gKE4i2lfatQJA4Q8rXgQ','raOZ1cf9LCGm03lv8SNBl','maybe');
INSERT INTO "votes" VALUES('K5NJvhLo6uklq7I_7_iyK','4n_lh6jyZiq7SoYmKPV9e','4m-IDZiT3aoidhMR42Rnf','maybe');
INSERT INTO "votes" VALUES('fG5T8X4ynNUp-5f12QZVh','eek3yeKswHoMU5q4MIZwn','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('XwSUk0vm3GnEtfxS4F2DL','lQPYj6diifhr5cjHcRDGl','4m-IDZiT3aoidhMR42Rnf','maybe');
INSERT INTO "votes" VALUES('id9QLugf_4jxWopVjMX5P','zUoA-D9upaLYWBBF6Cmmu','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('11loUwjNTj4Ti4Ov6YIOY','UG_gPNA9sNmcbYIE63zO4','4m-IDZiT3aoidhMR42Rnf','skip');
INSERT INTO "votes" VALUES('1_vDDlsnZ-_JslvhLZxxF','UCLEw11rVMP-jb6YFsMAF','3CD4RABuWkAWuu2dgKnxs','skip');
INSERT INTO "votes" VALUES('w_a7vw6dzp_6m3DsdEhm6','3gKE4i2lfatQJA4Q8rXgQ','3CD4RABuWkAWuu2dgKnxs','interested');
INSERT INTO "votes" VALUES('bFZHujYxD1ezdaMl5QUgO','sYUuJSPjIUyfj54pVkNgv','J4_Hfv_cYWR5PtJ2-fjB6','maybe');
INSERT INTO "votes" VALUES('qk_RJiZrXWvNS46XIdH13','lQPYj6diifhr5cjHcRDGl','J4_Hfv_cYWR5PtJ2-fjB6','maybe');
INSERT INTO "votes" VALUES('GU3yBlM8dfQrr-4YQlIyl','UG_gPNA9sNmcbYIE63zO4','J4_Hfv_cYWR5PtJ2-fjB6','skip');
INSERT INTO "votes" VALUES('ZzewxQyNaqe-6OMa9v5r6','sYUuJSPjIUyfj54pVkNgv','fzuhG07KpzgjEWVvggiTq','skip');
INSERT INTO "votes" VALUES('lMy_UCxpgHX6yj_S-Aw3k','UCLEw11rVMP-jb6YFsMAF','fzuhG07KpzgjEWVvggiTq','skip');
INSERT INTO "votes" VALUES('O76XOyoS-SMUzWk3yfxIF','4n_lh6jyZiq7SoYmKPV9e','fzuhG07KpzgjEWVvggiTq','skip');
INSERT INTO "votes" VALUES('saqhf9eByE2z19y_6971j','eek3yeKswHoMU5q4MIZwn','fzuhG07KpzgjEWVvggiTq','maybe');
INSERT INTO "votes" VALUES('xKnbl712UGPyNZ3muW50r','lQPYj6diifhr5cjHcRDGl','fzuhG07KpzgjEWVvggiTq','maybe');
INSERT INTO "votes" VALUES('nNR2vSCVRstvvgJZnpdG5','zUoA-D9upaLYWBBF6Cmmu','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('Y0XNNfM4TfT0iSuhmTX7R','UG_gPNA9sNmcbYIE63zO4','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('WMRzpeXEyW1QBC-N0T5bt','tZWX1Od_o57yKLy5yv014','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('ZBU3IklTafv05ZkeyWnEq','sYUuJSPjIUyfj54pVkNgv','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('h7xN7dDreS97NoFBkammd','UCLEw11rVMP-jb6YFsMAF','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('PnZ7yRN5Br2GKeP8Hi-wV','zUoA-D9upaLYWBBF6Cmmu','r2qBH1bBxh_WZFMnmpCem','maybe');
INSERT INTO "votes" VALUES('kKIa-by4DZYEo3-M3Naq4','tZWX1Od_o57yKLy5yv014','r2qBH1bBxh_WZFMnmpCem','skip');
INSERT INTO "votes" VALUES('CDrQ3A4LWGiEo7oU5wdka','4n_lh6jyZiq7SoYmKPV9e','A-2D3WcMxIxHkgCX-Zg6I','skip');
INSERT INTO "votes" VALUES('zpGpDzI8PPsGecE4Dm9gq','3gKE4i2lfatQJA4Q8rXgQ','A-2D3WcMxIxHkgCX-Zg6I','maybe');
INSERT INTO "votes" VALUES('oY4tstD-FUZM4J7cDAz5g','tZWX1Od_o57yKLy5yv014','A-2D3WcMxIxHkgCX-Zg6I','maybe');
INSERT INTO "votes" VALUES('0kfmBcpOtftSKpu-WLriR','UCLEw11rVMP-jb6YFsMAF','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('K4iYuOuftxrI6YdLZn1IH','4n_lh6jyZiq7SoYmKPV9e','aVzBIlBaG-Y1BhSMk8zuy','interested');
INSERT INTO "votes" VALUES('zwSTga8Fvk3AqyUWsEyKh','eek3yeKswHoMU5q4MIZwn','aVzBIlBaG-Y1BhSMk8zuy','interested');
INSERT INTO "votes" VALUES('SanJglCP3GN9oBzfXQWf2','rhB-guk1WoSA-QOQ9wnfT','aVzBIlBaG-Y1BhSMk8zuy','skip');
INSERT INTO "votes" VALUES('1GkRpxh2Ic-5iyeszSmoJ','tZWX1Od_o57yKLy5yv014','aVzBIlBaG-Y1BhSMk8zuy','skip');
INSERT INTO "votes" VALUES('ZBCPbK_LiHTv_hmeC3GrG','zUoA-D9upaLYWBBF6Cmmu','xaIzAJf0ygp2RH0x9Q0a9','maybe');
INSERT INTO "votes" VALUES('5lHCyca8KP90fE3MiFV_t','UG_gPNA9sNmcbYIE63zO4','xaIzAJf0ygp2RH0x9Q0a9','maybe');
INSERT INTO "votes" VALUES('V61YbJ2ARPF1Qrq5c-h0W','tZWX1Od_o57yKLy5yv014','xaIzAJf0ygp2RH0x9Q0a9','interested');
INSERT INTO "votes" VALUES('lm7BXGOTKAAuAj5cDZbnH','sYUuJSPjIUyfj54pVkNgv','lmWswbXj1DPwV1PbJJrUs','skip');
INSERT INTO "votes" VALUES('ah8cOnxxBPQ5IzdsUThwQ','UCLEw11rVMP-jb6YFsMAF','lmWswbXj1DPwV1PbJJrUs','skip');
INSERT INTO "votes" VALUES('Dyzk5fS9zCANJZyrW6NrA','eek3yeKswHoMU5q4MIZwn','lmWswbXj1DPwV1PbJJrUs','skip');
INSERT INTO "votes" VALUES('2ZMur7sg2tIEK1QENDEDt','rhB-guk1WoSA-QOQ9wnfT','lmWswbXj1DPwV1PbJJrUs','interested');
INSERT INTO "votes" VALUES('N38OfAuhu-gDA7tRv_Zeh','3gKE4i2lfatQJA4Q8rXgQ','lmWswbXj1DPwV1PbJJrUs','maybe');
INSERT INTO "votes" VALUES('d-OmzYTXrM48ZXGW0yS05','lQPYj6diifhr5cjHcRDGl','lmWswbXj1DPwV1PbJJrUs','interested');
INSERT INTO "votes" VALUES('4AISi6F4xf-Szy3PtlmDY','4n_lh6jyZiq7SoYmKPV9e','65nHCLlKwYqVTPhyJbvb0','maybe');
INSERT INTO "votes" VALUES('HaB2Lk45UBxOYfOHgRuG6','eek3yeKswHoMU5q4MIZwn','65nHCLlKwYqVTPhyJbvb0','skip');
INSERT INTO "votes" VALUES('SeiY4dqsYZoi4qosJ1Kpj','rhB-guk1WoSA-QOQ9wnfT','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('7-BBiKcFjLC5JLMZZmIsc','3gKE4i2lfatQJA4Q8rXgQ','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('XSs-r5hojHNY_WIIE118f','UG_gPNA9sNmcbYIE63zO4','fR7_6ZapXcBdI1nhPgQdJ','interested');
INSERT INTO "votes" VALUES('kSW-9IAv87J34oIIJAT0_','UCLEw11rVMP-jb6YFsMAF','g2Y2MEU9ag9J28Tpr6eSe','maybe');
INSERT INTO "votes" VALUES('54KK7l1uItQveqpzw-K6W','eek3yeKswHoMU5q4MIZwn','g2Y2MEU9ag9J28Tpr6eSe','interested');
INSERT INTO "votes" VALUES('pLvB2KTIc9VMP_EH-vETO','3gKE4i2lfatQJA4Q8rXgQ','g2Y2MEU9ag9J28Tpr6eSe','maybe');
INSERT INTO "votes" VALUES('mlCoOEliBgoqVafSJAmUi','lQPYj6diifhr5cjHcRDGl','g2Y2MEU9ag9J28Tpr6eSe','interested');
INSERT INTO "votes" VALUES('TQube_hpFXsNQsvvDSgj8','UG_gPNA9sNmcbYIE63zO4','g2Y2MEU9ag9J28Tpr6eSe','maybe');
INSERT INTO "votes" VALUES('vUExPANIze2Udzd-KOK9E','tZWX1Od_o57yKLy5yv014','g2Y2MEU9ag9J28Tpr6eSe','interested');
INSERT INTO "votes" VALUES('D85HMcERk5fGjvfxqJrmC','4n_lh6jyZiq7SoYmKPV9e','LqMrw2W4Q8rtgz6hOrr_h','skip');
INSERT INTO "votes" VALUES('Hxpq7Ak4t4oXRf7zKLZaH','eek3yeKswHoMU5q4MIZwn','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('KWQs74aFdoDr7uDBo1H7B','3gKE4i2lfatQJA4Q8rXgQ','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('UZ8pN7TvqepH02JECURoi','lQPYj6diifhr5cjHcRDGl','LqMrw2W4Q8rtgz6hOrr_h','maybe');
INSERT INTO "votes" VALUES('KZQ9kqXnvB2_wpE3MeeuY','zUoA-D9upaLYWBBF6Cmmu','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('weunBWo0uqX72WYqhaqc9','UG_gPNA9sNmcbYIE63zO4','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('4ULvvniHMkJI1EYL9p4HB','UCLEw11rVMP-jb6YFsMAF','xadk-um1OLVQWW470yALm','skip');
INSERT INTO "votes" VALUES('fcydgEWORIHKiKyANGO84','4n_lh6jyZiq7SoYmKPV9e','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('VmsZYxCV32tZsp13ehTx_','eek3yeKswHoMU5q4MIZwn','xadk-um1OLVQWW470yALm','skip');
INSERT INTO "votes" VALUES('lCRt7yYBK1SYGYkfzvtZt','lQPYj6diifhr5cjHcRDGl','xadk-um1OLVQWW470yALm','maybe');
INSERT INTO "votes" VALUES('m91vJK9--nxopuP4giVZP','UG_gPNA9sNmcbYIE63zO4','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('guyvxuwN9JFv7Yx78u2NK','tZWX1Od_o57yKLy5yv014','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('RpzdsWn2DXNgLHArLJPpw','sYUuJSPjIUyfj54pVkNgv','hUXi67irZFzKskSGBzqIE','interested');
INSERT INTO "votes" VALUES('Eqn7vqiJa_0hwyPc3MW9P','UCLEw11rVMP-jb6YFsMAF','hUXi67irZFzKskSGBzqIE','interested');
INSERT INTO "votes" VALUES('jmZn5ubUr0UKIs3D10uqJ','zUoA-D9upaLYWBBF6Cmmu','hUXi67irZFzKskSGBzqIE','maybe');
INSERT INTO "votes" VALUES('3IHdRV3M_OErjAezYkDqi','UG_gPNA9sNmcbYIE63zO4','hUXi67irZFzKskSGBzqIE','maybe');
INSERT INTO "votes" VALUES('_ggTuHRnhhX2oFhJ4A80y','sYUuJSPjIUyfj54pVkNgv','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('xZc2WVFXn5lWXDSl0-4hW','UCLEw11rVMP-jb6YFsMAF','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('ScpdzKyDMpe_MPnC9xozL','4n_lh6jyZiq7SoYmKPV9e','FeIrMPprVHhS50rMvgVLd','skip');
INSERT INTO "votes" VALUES('6QEA3CeuPpTmD9hwnrC1h','3gKE4i2lfatQJA4Q8rXgQ','FeIrMPprVHhS50rMvgVLd','maybe');
INSERT INTO "votes" VALUES('npkkl4RPGYvzrxyndjXPg','UG_gPNA9sNmcbYIE63zO4','FeIrMPprVHhS50rMvgVLd','skip');
INSERT INTO "votes" VALUES('nEl9_PKLZD5y6voYtWbDS','tZWX1Od_o57yKLy5yv014','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('P1KvzzqZjY2RUV57-QoT1','sYUuJSPjIUyfj54pVkNgv','KyxxptSs-hAFIaAIBYwqo','maybe');
INSERT INTO "votes" VALUES('3ab7eM-OcnIM1foXZaWa4','3gKE4i2lfatQJA4Q8rXgQ','KyxxptSs-hAFIaAIBYwqo','maybe');
INSERT INTO "votes" VALUES('8MEK2gbsiEiHGEZmWJPEQ','lQPYj6diifhr5cjHcRDGl','KyxxptSs-hAFIaAIBYwqo','interested');
INSERT INTO "votes" VALUES('ZcXrUyJoDG55l2eOnkz5o','zUoA-D9upaLYWBBF6Cmmu','KyxxptSs-hAFIaAIBYwqo','interested');
INSERT INTO "votes" VALUES('l3hHEPc1lZYrQlJcvyyd9','tZWX1Od_o57yKLy5yv014','KyxxptSs-hAFIaAIBYwqo','interested');
INSERT INTO "votes" VALUES('ops11WVjGdssfvw7bifkN','eek3yeKswHoMU5q4MIZwn','nbvsqreGd-qltpMrQMgUj','skip');
INSERT INTO "votes" VALUES('nCqR5bvzYsQHiRxx8Q4NM','rhB-guk1WoSA-QOQ9wnfT','nbvsqreGd-qltpMrQMgUj','interested');
INSERT INTO "votes" VALUES('iEKuO4Vu6WSkPTMo35RRL','lQPYj6diifhr5cjHcRDGl','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('k-pbkYPfvg1hsPgUKDVH7','zUoA-D9upaLYWBBF6Cmmu','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('Ee7EXgpw_CK4qUCTnrkz8','sYUuJSPjIUyfj54pVkNgv','q1J2GxzP0jcxIVSUeNEW8','maybe');
INSERT INTO "votes" VALUES('9NrJwgeRYy7CrCnxc1uit','lQPYj6diifhr5cjHcRDGl','q1J2GxzP0jcxIVSUeNEW8','interested');
INSERT INTO "votes" VALUES('uN4yVEwwXmW4d04UunSNS','UG_gPNA9sNmcbYIE63zO4','q1J2GxzP0jcxIVSUeNEW8','interested');
INSERT INTO "votes" VALUES('MstrUD_RNWqwgJM2cZrLQ','tZWX1Od_o57yKLy5yv014','q1J2GxzP0jcxIVSUeNEW8','skip');
INSERT INTO "votes" VALUES('T5S--Opj_Znvp8Vg7pJ4e','sYUuJSPjIUyfj54pVkNgv','jFXpawOxJ84YUQ1QeUdax','interested');
INSERT INTO "votes" VALUES('1ePN5hYuNqaYbhPBaJZlk','4n_lh6jyZiq7SoYmKPV9e','jFXpawOxJ84YUQ1QeUdax','maybe');
INSERT INTO "votes" VALUES('UsljTV72lu9cCzc9Sc14W','3gKE4i2lfatQJA4Q8rXgQ','jFXpawOxJ84YUQ1QeUdax','interested');
INSERT INTO "votes" VALUES('B1RZ3yHe08aGFhkEmGz0L','tZWX1Od_o57yKLy5yv014','jFXpawOxJ84YUQ1QeUdax','skip');
INSERT INTO "votes" VALUES('q1L6yKvl6YVyFXlzwgGsW','3gKE4i2lfatQJA4Q8rXgQ','B6LlBxVXBcCTj4yw_syvn','skip');
INSERT INTO "votes" VALUES('KQXLojygGT6LJw6tQ48rU','UG_gPNA9sNmcbYIE63zO4','B6LlBxVXBcCTj4yw_syvn','interested');
INSERT INTO "votes" VALUES('ykb5GTvENFzRSZH452Wx2','tZWX1Od_o57yKLy5yv014','B6LlBxVXBcCTj4yw_syvn','maybe');
INSERT INTO "votes" VALUES('cflNFMbuVGOK0s8IC0Z-4','sYUuJSPjIUyfj54pVkNgv','joBV_Xbwxsri3Yx8LlPiH','maybe');
INSERT INTO "votes" VALUES('KHtQ99dRsNPsC3BT0Cbpy','UCLEw11rVMP-jb6YFsMAF','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('viEcW2lFqMsfHrKhlzJUI','3gKE4i2lfatQJA4Q8rXgQ','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('011HWe8XTAN5wXUQCEmSV','lQPYj6diifhr5cjHcRDGl','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('5IXRStn20ByJeT3c31lg1','zUoA-D9upaLYWBBF6Cmmu','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('Ib1f5trN2PmpcdlZopBH7','UG_gPNA9sNmcbYIE63zO4','joBV_Xbwxsri3Yx8LlPiH','maybe');
INSERT INTO "votes" VALUES('jVp-zi6JCUYR2m_7a4x3m','sYUuJSPjIUyfj54pVkNgv','bFc2AxCyHQ5JmK0AOC-3k','maybe');
INSERT INTO "votes" VALUES('eLwV14s3cgbG8FiNYmJFK','4n_lh6jyZiq7SoYmKPV9e','bFc2AxCyHQ5JmK0AOC-3k','skip');
INSERT INTO "votes" VALUES('l0N8HGqQYjSv1_BN-Xyn2','tZWX1Od_o57yKLy5yv014','bFc2AxCyHQ5JmK0AOC-3k','maybe');
INSERT INTO "votes" VALUES('HcCnlpnrOKCyYOs_X7rp3','UCLEw11rVMP-jb6YFsMAF','71eYkQyF2gtMVzNEz4Ceg','maybe');
INSERT INTO "votes" VALUES('_yI1i3_G9jW0wLF_oAdov','3gKE4i2lfatQJA4Q8rXgQ','71eYkQyF2gtMVzNEz4Ceg','interested');
INSERT INTO "votes" VALUES('pa62gWsiR7AUyeuBLdinv','zUoA-D9upaLYWBBF6Cmmu','71eYkQyF2gtMVzNEz4Ceg','skip');
INSERT INTO "votes" VALUES('ccK9nHa0x9kyA_P-ry-15','sYUuJSPjIUyfj54pVkNgv','BS_eMdb5qYIj_yExay5QI','interested');
INSERT INTO "votes" VALUES('NORJlaG0KNPYOrasvzVUF','eek3yeKswHoMU5q4MIZwn','BS_eMdb5qYIj_yExay5QI','skip');
INSERT INTO "votes" VALUES('y5KaQOuKGT_XWMIEKCv2M','lQPYj6diifhr5cjHcRDGl','BS_eMdb5qYIj_yExay5QI','interested');
INSERT INTO "votes" VALUES('hxc8-Wz9XXsBZlJdRTxOv','sYUuJSPjIUyfj54pVkNgv','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('KXvs5hq9vE05eVCY-Vlu5','4n_lh6jyZiq7SoYmKPV9e','T_vMnJyje-liMbme_4Efb','interested');
INSERT INTO "votes" VALUES('p5S2jMWmuaC528roEZRnn','zUoA-D9upaLYWBBF6Cmmu','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('RNID-l10RALRw4WpT_Mq1','UG_gPNA9sNmcbYIE63zO4','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('ufw-UvPrWRqTWWin1uZzz','tZWX1Od_o57yKLy5yv014','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('El6CJjTZ7tK-oJ6khvvpx','sYUuJSPjIUyfj54pVkNgv','pccefhg_NrlvJHuVUIFHm','maybe');
INSERT INTO "votes" VALUES('vn3uenQ7TYSmC_1-FqoqO','4n_lh6jyZiq7SoYmKPV9e','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('EcOiwvff-QkHvWqDrod5t','lQPYj6diifhr5cjHcRDGl','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('HrP7kBgowTIJNspUMW8pq','sYUuJSPjIUyfj54pVkNgv','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('mjMHDCQru5bwlp6oe5Ai6','4n_lh6jyZiq7SoYmKPV9e','7_z70nuNqFlZXFLA76Ift','maybe');
INSERT INTO "votes" VALUES('LVuaogaakjqZE0LELXarH','eek3yeKswHoMU5q4MIZwn','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('bKODk5PTTvZnyezsZZE8p','3gKE4i2lfatQJA4Q8rXgQ','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('zdA4iOvb7UU3C2FSpB3aK','sYUuJSPjIUyfj54pVkNgv','WSSlq8biti-tqLOLCyJwc','interested');
INSERT INTO "votes" VALUES('8Hhf2rzPJFpyvyZgPcBPD','lQPYj6diifhr5cjHcRDGl','WSSlq8biti-tqLOLCyJwc','maybe');
INSERT INTO "votes" VALUES('glNHVgBzwGRfd66-Su138','tZWX1Od_o57yKLy5yv014','WSSlq8biti-tqLOLCyJwc','maybe');
INSERT INTO "votes" VALUES('PYY-ncN6FNf8csnOnJUqW','sYUuJSPjIUyfj54pVkNgv','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('U6dDL_shHsJq7_jgd9VXQ','UCLEw11rVMP-jb6YFsMAF','a17N0EkVvIliYoDwqyKG7','skip');
INSERT INTO "votes" VALUES('m33Fg9xRQtdbXj9JhOSkL','rhB-guk1WoSA-QOQ9wnfT','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('6teA5exS3VW7w5HAlp1AV','3gKE4i2lfatQJA4Q8rXgQ','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('m4Ht-IuaBoNaEprpL2QWi','zUoA-D9upaLYWBBF6Cmmu','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('47I8KUDE81EqHbuB5eyLM','UG_gPNA9sNmcbYIE63zO4','a17N0EkVvIliYoDwqyKG7','maybe');
INSERT INTO "votes" VALUES('2A_6XwC4BG2KRz9LdCYR7','rhB-guk1WoSA-QOQ9wnfT','MuPXEoJa6zGQGTXZpqSLf','interested');
INSERT INTO "votes" VALUES('EFxzOPlnwguh6eoa79geO','sYUuJSPjIUyfj54pVkNgv','uGj9-HQqb3vnIv_juOw-C','skip');
INSERT INTO "votes" VALUES('6qTb5vLQKsxXzMluwgzXJ','UCLEw11rVMP-jb6YFsMAF','uGj9-HQqb3vnIv_juOw-C','interested');
INSERT INTO "votes" VALUES('O4Cc-LgFlU9eSo2jtwIRw','zUoA-D9upaLYWBBF6Cmmu','uGj9-HQqb3vnIv_juOw-C','skip');
INSERT INTO "votes" VALUES('6mP9jbkTgcu67JqoqWQB2','UG_gPNA9sNmcbYIE63zO4','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('CyiV6WmWJSw0Kq-WvMF6F','3gKE4i2lfatQJA4Q8rXgQ','NPO7h8xslD0uHfUC_Edb0','interested');
INSERT INTO "votes" VALUES('cTxeLF32AeSUpyCRsLMQA','zUoA-D9upaLYWBBF6Cmmu','NPO7h8xslD0uHfUC_Edb0','interested');
INSERT INTO "votes" VALUES('kfx86-zVrrCxy5yEpWnaK','sYUuJSPjIUyfj54pVkNgv','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('iiFLfkhB5GAVtoeyYq5n_','eek3yeKswHoMU5q4MIZwn','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('_4KvV7e_YEQa-hqYfoETc','rhB-guk1WoSA-QOQ9wnfT','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('Llr3VEVPu9TEDaSErd_FV','3gKE4i2lfatQJA4Q8rXgQ','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('iFY6grEFdQ9G7ScefSoAo','zUoA-D9upaLYWBBF6Cmmu','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('iuv80II5EY8NJ63y3pWtY','UG_gPNA9sNmcbYIE63zO4','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('RTwTGJd6dWG-hxqkPrLMb','eek3yeKswHoMU5q4MIZwn','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('o6BWoZBCk_3Zzm1-cIKXz','lQPYj6diifhr5cjHcRDGl','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('aJeeHcZ67kgIqYs85b1bW','4n_lh6jyZiq7SoYmKPV9e','JqQJB9R06rqD3wogvFy98','maybe');
INSERT INTO "votes" VALUES('sHWDHU-Oic8FxziYjUZgf','eek3yeKswHoMU5q4MIZwn','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('54wV7MELwbs4DG4IjsnY4','rhB-guk1WoSA-QOQ9wnfT','JqQJB9R06rqD3wogvFy98','maybe');
INSERT INTO "votes" VALUES('HkiP6BfPw1hpKjheHH9Iy','tZWX1Od_o57yKLy5yv014','JqQJB9R06rqD3wogvFy98','skip');
INSERT INTO "votes" VALUES('8s7HDgnE2MXgrzoqvAte2','sYUuJSPjIUyfj54pVkNgv','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('AOIwlcGiVF7OZpGGPbg5B','UCLEw11rVMP-jb6YFsMAF','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('hXJCO3qznBvAJDk-FR7j4','4n_lh6jyZiq7SoYmKPV9e','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('Vv8X25gS3FleRAgeFgK5l','rhB-guk1WoSA-QOQ9wnfT','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('VFyoGLVM_bcn7mNfVZ9P8','3gKE4i2lfatQJA4Q8rXgQ','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('NACZqu9fLTLLT97FnTU_W','zUoA-D9upaLYWBBF6Cmmu','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('7cb5_gofy_b3oEgoH6WLl','tZWX1Od_o57yKLy5yv014','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('tyhp7hc845gcWPlntUqQO','uC0luPhFpnhkJ7rsjolsR','qYrnpWvEbqovxJrU7-bLc','maybe');
INSERT INTO "votes" VALUES('9hq63t_P5rNzmLrfOuNH_','DAwFh6FR0NR0BNSXCzy7K','qYrnpWvEbqovxJrU7-bLc','skip');
INSERT INTO "votes" VALUES('7TkTQAJuxPWvpSvV9gMPQ','2sEzH27DcQ6kstyn1Gjny','qYrnpWvEbqovxJrU7-bLc','skip');
INSERT INTO "votes" VALUES('WTk1OJ2jsDZHn7QA9SGBD','8rhOqtPVHgfnalTM1hYx6','qYrnpWvEbqovxJrU7-bLc','maybe');
INSERT INTO "votes" VALUES('OqHREauVRO6nY75OfOzwn','b__vtFYuRTJ8cJm0mn_vP','qYrnpWvEbqovxJrU7-bLc','skip');
INSERT INTO "votes" VALUES('rIaKp4ut7CXrMpgVNzqsm','j66WwaIyXuqRLD8i2n84f','qYrnpWvEbqovxJrU7-bLc','interested');
INSERT INTO "votes" VALUES('pIZsWuuQ32FioIOPESN82','Q44c6XXdPyHN0n0jHZuaT','qYrnpWvEbqovxJrU7-bLc','interested');
INSERT INTO "votes" VALUES('FAoQwzVqkfHHn_FNMqPoT','XtMzz15sjim3vRCLv4c9y','qYrnpWvEbqovxJrU7-bLc','skip');
INSERT INTO "votes" VALUES('eVfBozO2aNG2TULk7DSif','uC0luPhFpnhkJ7rsjolsR','ZR_N3BysPeGSmkw1Sc6As','skip');
INSERT INTO "votes" VALUES('XboaqKJARwMHZ-XysIbAO','ji38S3aoglBOZc0aPwUSH','ZR_N3BysPeGSmkw1Sc6As','skip');
INSERT INTO "votes" VALUES('vEFHqBcY5kfulc4BDbBiV','2sEzH27DcQ6kstyn1Gjny','ZR_N3BysPeGSmkw1Sc6As','skip');
INSERT INTO "votes" VALUES('xWCIfRL5SWRQ-lyP_1TGu','8rhOqtPVHgfnalTM1hYx6','ZR_N3BysPeGSmkw1Sc6As','interested');
INSERT INTO "votes" VALUES('3zMBLwbqsqpn4YvsgmJXO','j66WwaIyXuqRLD8i2n84f','ZR_N3BysPeGSmkw1Sc6As','skip');
INSERT INTO "votes" VALUES('EtPKjAt8vrSuPEHny20QH','31AjqCtJGl6V24loAsoYx','ZR_N3BysPeGSmkw1Sc6As','maybe');
INSERT INTO "votes" VALUES('zfE3SKIo14gvwTzoYZlh-','lompyy4dfmUO3N1vCHTpI','raOZ1cf9LCGm03lv8SNBl','maybe');
INSERT INTO "votes" VALUES('AzFQPuG6j6BgLnZ13E4bx','2sEzH27DcQ6kstyn1Gjny','raOZ1cf9LCGm03lv8SNBl','interested');
INSERT INTO "votes" VALUES('8plNuuCz-NUqZ2DJTksP1','Odpn-eQJ9X3tKoUWx3HAh','raOZ1cf9LCGm03lv8SNBl','interested');
INSERT INTO "votes" VALUES('sxA82TNOVjptSkBrZ7dfs','SyxcIDrH3euzlwiZlpfjo','raOZ1cf9LCGm03lv8SNBl','skip');
INSERT INTO "votes" VALUES('WhBWQ1ooBqVlZdricrGws','jrJxUJToRW-iZmPZs6RIl','raOZ1cf9LCGm03lv8SNBl','maybe');
INSERT INTO "votes" VALUES('sOViTR-cSJ4ex6yn4pZD4','AXCjmtv06asHkXpI82hNu','raOZ1cf9LCGm03lv8SNBl','skip');
INSERT INTO "votes" VALUES('uYqTrDNq13eCmRs5vQ3aB','Q44c6XXdPyHN0n0jHZuaT','raOZ1cf9LCGm03lv8SNBl','skip');
INSERT INTO "votes" VALUES('CCXAma79Ua7JfdYSUKEej','XtMzz15sjim3vRCLv4c9y','raOZ1cf9LCGm03lv8SNBl','skip');
INSERT INTO "votes" VALUES('-HDKFbz_riBTiE1lHM1Gu','hxlFtu_R6mN2PxCo4UhWf','4m-IDZiT3aoidhMR42Rnf','skip');
INSERT INTO "votes" VALUES('OUUPHIXNPB2a3z5GN5QiS','DAwFh6FR0NR0BNSXCzy7K','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('3sa0w1Ko3fORGGjsXdAS6','ji38S3aoglBOZc0aPwUSH','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('p7DV-afDDhgFpr6Y3GdjJ','2sEzH27DcQ6kstyn1Gjny','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('omtLVWPt6sRdSmfi4GJNP','Odpn-eQJ9X3tKoUWx3HAh','4m-IDZiT3aoidhMR42Rnf','maybe');
INSERT INTO "votes" VALUES('TVn6V_iEe8erXP2Te0025','b__vtFYuRTJ8cJm0mn_vP','4m-IDZiT3aoidhMR42Rnf','maybe');
INSERT INTO "votes" VALUES('MFbEdNof3S4eraL0ahBTl','jrJxUJToRW-iZmPZs6RIl','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('dMxgbF4S2oQjWDfnMP_Rz','Q44c6XXdPyHN0n0jHZuaT','4m-IDZiT3aoidhMR42Rnf','maybe');
INSERT INTO "votes" VALUES('Mvf9UQmsghPJS937bzk5m','XtMzz15sjim3vRCLv4c9y','4m-IDZiT3aoidhMR42Rnf','interested');
INSERT INTO "votes" VALUES('feT-go0vbHeRlPjhdUyxS','DAwFh6FR0NR0BNSXCzy7K','3CD4RABuWkAWuu2dgKnxs','maybe');
INSERT INTO "votes" VALUES('zpP2SniOPV9PGzdzeMi0I','ji38S3aoglBOZc0aPwUSH','3CD4RABuWkAWuu2dgKnxs','maybe');
INSERT INTO "votes" VALUES('mELnpXPdMXvNvSHAUiV5w','b__vtFYuRTJ8cJm0mn_vP','3CD4RABuWkAWuu2dgKnxs','interested');
INSERT INTO "votes" VALUES('sxS209pwf9g9OGSyQi4nj','31AjqCtJGl6V24loAsoYx','3CD4RABuWkAWuu2dgKnxs','interested');
INSERT INTO "votes" VALUES('Zjwfbcx_rq7yNMSYlMEzJ','3mH4jHlQFsffmSkAHe8DC','3CD4RABuWkAWuu2dgKnxs','interested');
INSERT INTO "votes" VALUES('sAyvI7kGQgmqbShXl0Jpm','2sEzH27DcQ6kstyn1Gjny','J4_Hfv_cYWR5PtJ2-fjB6','interested');
INSERT INTO "votes" VALUES('fdI5TIZOLJ8KJBnbhurZ0','Odpn-eQJ9X3tKoUWx3HAh','J4_Hfv_cYWR5PtJ2-fjB6','maybe');
INSERT INTO "votes" VALUES('epb8HZD6hsqAqRVYvFs9y','8rhOqtPVHgfnalTM1hYx6','J4_Hfv_cYWR5PtJ2-fjB6','skip');
INSERT INTO "votes" VALUES('3fp0MZqTSEioZ-7m7acUx','SyxcIDrH3euzlwiZlpfjo','J4_Hfv_cYWR5PtJ2-fjB6','interested');
INSERT INTO "votes" VALUES('3YBGZq6ScZGeBX1yd9yK6','b__vtFYuRTJ8cJm0mn_vP','J4_Hfv_cYWR5PtJ2-fjB6','skip');
INSERT INTO "votes" VALUES('0v6IqhR9C2HdIU1Z7mjSp','31AjqCtJGl6V24loAsoYx','J4_Hfv_cYWR5PtJ2-fjB6','maybe');
INSERT INTO "votes" VALUES('vB7iYG94IvWUPCQfqbi_9','3mH4jHlQFsffmSkAHe8DC','J4_Hfv_cYWR5PtJ2-fjB6','maybe');
INSERT INTO "votes" VALUES('ezqwXyeoG5NCBIPOZvPAP','DAwFh6FR0NR0BNSXCzy7K','fzuhG07KpzgjEWVvggiTq','skip');
INSERT INTO "votes" VALUES('hqkMLm8nT1k-wYdyNIYay','lompyy4dfmUO3N1vCHTpI','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('9MQ2HdTA0NGVHxClaj2Xx','2sEzH27DcQ6kstyn1Gjny','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('GivUaqtRAvxpvBnIH1Yz3','hAnnqs7WweE28dDpwm4h5','fzuhG07KpzgjEWVvggiTq','maybe');
INSERT INTO "votes" VALUES('Jea5uXeBaGvHHEe1V8jD7','b__vtFYuRTJ8cJm0mn_vP','fzuhG07KpzgjEWVvggiTq','maybe');
INSERT INTO "votes" VALUES('229BVsum-jA2HXfrFhDyr','AXCjmtv06asHkXpI82hNu','fzuhG07KpzgjEWVvggiTq','interested');
INSERT INTO "votes" VALUES('5WuQ2H_OOWhyCDx9RlkEU','XtMzz15sjim3vRCLv4c9y','fzuhG07KpzgjEWVvggiTq','maybe');
INSERT INTO "votes" VALUES('d--ArBnGQQunH-WoWGS5F','DAwFh6FR0NR0BNSXCzy7K','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('0dkV3yp_MAhmOSqawBQvD','lompyy4dfmUO3N1vCHTpI','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('6vMJKpQx3YFVzrYo67NLy','ji38S3aoglBOZc0aPwUSH','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('PUYy09y-Xke-CHDsORLEE','2sEzH27DcQ6kstyn1Gjny','r2qBH1bBxh_WZFMnmpCem','maybe');
INSERT INTO "votes" VALUES('_EUE2GajzaBccD1AJNnbU','Odpn-eQJ9X3tKoUWx3HAh','r2qBH1bBxh_WZFMnmpCem','skip');
INSERT INTO "votes" VALUES('LtMLSAHMg1USPa2dtCp8x','b__vtFYuRTJ8cJm0mn_vP','r2qBH1bBxh_WZFMnmpCem','interested');
INSERT INTO "votes" VALUES('2c-IBwmpR2x16N4W-1nLC','AXCjmtv06asHkXpI82hNu','r2qBH1bBxh_WZFMnmpCem','maybe');
INSERT INTO "votes" VALUES('9cohyl3W4V5ZsHmulNB3v','Q44c6XXdPyHN0n0jHZuaT','r2qBH1bBxh_WZFMnmpCem','maybe');
INSERT INTO "votes" VALUES('MZnHtElfFKqEzJsabjXFB','3mH4jHlQFsffmSkAHe8DC','r2qBH1bBxh_WZFMnmpCem','maybe');
INSERT INTO "votes" VALUES('O2FQEWGmau3A-vJliNV2a','hAnnqs7WweE28dDpwm4h5','A-2D3WcMxIxHkgCX-Zg6I','skip');
INSERT INTO "votes" VALUES('UFIPJimGvRQa8mHOR1tK3','Odpn-eQJ9X3tKoUWx3HAh','A-2D3WcMxIxHkgCX-Zg6I','maybe');
INSERT INTO "votes" VALUES('7r6q6leswLNy40ea3ZFQO','8rhOqtPVHgfnalTM1hYx6','A-2D3WcMxIxHkgCX-Zg6I','interested');
INSERT INTO "votes" VALUES('c9YLe3wjamBwgRTl9fThp','SyxcIDrH3euzlwiZlpfjo','A-2D3WcMxIxHkgCX-Zg6I','interested');
INSERT INTO "votes" VALUES('3ZAKxk8pXryoBL5OQVuOP','b__vtFYuRTJ8cJm0mn_vP','A-2D3WcMxIxHkgCX-Zg6I','interested');
INSERT INTO "votes" VALUES('vNq4jTLNNkkCw1TAYJ2Y-','jrJxUJToRW-iZmPZs6RIl','A-2D3WcMxIxHkgCX-Zg6I','interested');
INSERT INTO "votes" VALUES('O3iObPTGaq_eO26AhqojK','unY7SfK1vT9qbpdmKAzx1','A-2D3WcMxIxHkgCX-Zg6I','maybe');
INSERT INTO "votes" VALUES('T8nCigDOIp6agWaEJSee7','31AjqCtJGl6V24loAsoYx','A-2D3WcMxIxHkgCX-Zg6I','maybe');
INSERT INTO "votes" VALUES('68tZXmSFxxtKMEyR2vWZz','XtMzz15sjim3vRCLv4c9y','A-2D3WcMxIxHkgCX-Zg6I','interested');
INSERT INTO "votes" VALUES('BJnwr-ttzGep91rT_qG5G','hxlFtu_R6mN2PxCo4UhWf','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('yttbhnPTkGGhDl87WABzo','uC0luPhFpnhkJ7rsjolsR','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('KvKEtHFNc6wkXxdCJJ7n7','DAwFh6FR0NR0BNSXCzy7K','aVzBIlBaG-Y1BhSMk8zuy','interested');
INSERT INTO "votes" VALUES('mdZMaSjfhzmn2Du-qAYs3','2sEzH27DcQ6kstyn1Gjny','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('PEEJi18BqZryY-q0QEGyg','SyxcIDrH3euzlwiZlpfjo','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('oIlh8_-9Re0YAKu87cOyY','31AjqCtJGl6V24loAsoYx','aVzBIlBaG-Y1BhSMk8zuy','maybe');
INSERT INTO "votes" VALUES('wlCYz-J5dpe9VZtzRnv9n','ji38S3aoglBOZc0aPwUSH','xaIzAJf0ygp2RH0x9Q0a9','maybe');
INSERT INTO "votes" VALUES('iGq_oY0EswUfLCtopB4Vo','hAnnqs7WweE28dDpwm4h5','xaIzAJf0ygp2RH0x9Q0a9','maybe');
INSERT INTO "votes" VALUES('7KClwaUkyjygGQS-uXXMj','8rhOqtPVHgfnalTM1hYx6','xaIzAJf0ygp2RH0x9Q0a9','skip');
INSERT INTO "votes" VALUES('dAA2Gu-ZgnoDFjJuZUaeH','jrJxUJToRW-iZmPZs6RIl','xaIzAJf0ygp2RH0x9Q0a9','interested');
INSERT INTO "votes" VALUES('1GPF5aOQ7cZPQCf0cxUtq','AXCjmtv06asHkXpI82hNu','xaIzAJf0ygp2RH0x9Q0a9','interested');
INSERT INTO "votes" VALUES('L8RzWdamNj-_EMrLMkjBx','j66WwaIyXuqRLD8i2n84f','xaIzAJf0ygp2RH0x9Q0a9','skip');
INSERT INTO "votes" VALUES('GXiFD4t2013nTqnizY7jN','unY7SfK1vT9qbpdmKAzx1','xaIzAJf0ygp2RH0x9Q0a9','skip');
INSERT INTO "votes" VALUES('ARGNh8n2Ue-wmcYEYDmPt','31AjqCtJGl6V24loAsoYx','xaIzAJf0ygp2RH0x9Q0a9','interested');
INSERT INTO "votes" VALUES('DhtOfu9GyZUbfKP6xhhfx','3mH4jHlQFsffmSkAHe8DC','xaIzAJf0ygp2RH0x9Q0a9','interested');
INSERT INTO "votes" VALUES('NXIo3IuN9e--0UYW_VVhb','DAwFh6FR0NR0BNSXCzy7K','lmWswbXj1DPwV1PbJJrUs','interested');
INSERT INTO "votes" VALUES('zwrLhZ9QpC1yWjmZWwKvk','j66WwaIyXuqRLD8i2n84f','lmWswbXj1DPwV1PbJJrUs','maybe');
INSERT INTO "votes" VALUES('gR5cDQzDUxYpkXQvajNIT','XtMzz15sjim3vRCLv4c9y','lmWswbXj1DPwV1PbJJrUs','skip');
INSERT INTO "votes" VALUES('v5xJUiddMsIZOF0_N8IdK','ji38S3aoglBOZc0aPwUSH','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('H41l_tpaKAVJPaM6RfjO4','2sEzH27DcQ6kstyn1Gjny','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('OepqugKDb-J7CXkNCuS_g','Odpn-eQJ9X3tKoUWx3HAh','65nHCLlKwYqVTPhyJbvb0','maybe');
INSERT INTO "votes" VALUES('Ppj38VHu63TT8H1IKCOD5','AXCjmtv06asHkXpI82hNu','65nHCLlKwYqVTPhyJbvb0','maybe');
INSERT INTO "votes" VALUES('zWX22VOHSuo5bfV6s8Wvh','unY7SfK1vT9qbpdmKAzx1','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('j1J8yhSYFQwq2RP6JAg9W','Q44c6XXdPyHN0n0jHZuaT','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('GKTYpIfF7WrS_HpiZm1NO','3mH4jHlQFsffmSkAHe8DC','65nHCLlKwYqVTPhyJbvb0','skip');
INSERT INTO "votes" VALUES('G_diG_drfgQlHw9hSpWH6','XtMzz15sjim3vRCLv4c9y','65nHCLlKwYqVTPhyJbvb0','interested');
INSERT INTO "votes" VALUES('NxRQ9yQtBF_LME9TyvCUa','hxlFtu_R6mN2PxCo4UhWf','fR7_6ZapXcBdI1nhPgQdJ','interested');
INSERT INTO "votes" VALUES('VzEOoubf-8jb8qVRnXzyZ','uC0luPhFpnhkJ7rsjolsR','fR7_6ZapXcBdI1nhPgQdJ','skip');
INSERT INTO "votes" VALUES('X4Jy1SKiVFl0zCvEgxQX9','2sEzH27DcQ6kstyn1Gjny','fR7_6ZapXcBdI1nhPgQdJ','skip');
INSERT INTO "votes" VALUES('qMnIgq9u2ALZxblHp0PGX','hAnnqs7WweE28dDpwm4h5','fR7_6ZapXcBdI1nhPgQdJ','maybe');
INSERT INTO "votes" VALUES('CJQ9OyLbA0m_W2kt7t5ei','jrJxUJToRW-iZmPZs6RIl','fR7_6ZapXcBdI1nhPgQdJ','maybe');
INSERT INTO "votes" VALUES('Q39oJocwwywRwWoXyW3Bj','unY7SfK1vT9qbpdmKAzx1','fR7_6ZapXcBdI1nhPgQdJ','interested');
INSERT INTO "votes" VALUES('4pPcTb6-WKs8T5dmUIR-6','Q44c6XXdPyHN0n0jHZuaT','fR7_6ZapXcBdI1nhPgQdJ','maybe');
INSERT INTO "votes" VALUES('IxlgZz9mZHVCx8zRpYefp','31AjqCtJGl6V24loAsoYx','fR7_6ZapXcBdI1nhPgQdJ','maybe');
INSERT INTO "votes" VALUES('JWP-dzbYJrVn2Vzo3NByQ','3mH4jHlQFsffmSkAHe8DC','fR7_6ZapXcBdI1nhPgQdJ','skip');
INSERT INTO "votes" VALUES('aftIk4LLEYio1IpTD6L9V','XtMzz15sjim3vRCLv4c9y','fR7_6ZapXcBdI1nhPgQdJ','maybe');
INSERT INTO "votes" VALUES('xBLdrMNwEjN8PMNmbd68s','ji38S3aoglBOZc0aPwUSH','g2Y2MEU9ag9J28Tpr6eSe','skip');
INSERT INTO "votes" VALUES('5-ffDeYihXgLknbA_d0G0','hAnnqs7WweE28dDpwm4h5','g2Y2MEU9ag9J28Tpr6eSe','maybe');
INSERT INTO "votes" VALUES('RtpNDVm1gN1sRVM_ElOYm','SyxcIDrH3euzlwiZlpfjo','g2Y2MEU9ag9J28Tpr6eSe','skip');
INSERT INTO "votes" VALUES('RrJclJf50MHiRDPaoSR2f','b__vtFYuRTJ8cJm0mn_vP','g2Y2MEU9ag9J28Tpr6eSe','skip');
INSERT INTO "votes" VALUES('uciOhlc_dzIUagXpQX6xZ','j66WwaIyXuqRLD8i2n84f','g2Y2MEU9ag9J28Tpr6eSe','interested');
INSERT INTO "votes" VALUES('k2oJeZV-oFOCn4fQ7c9Bv','unY7SfK1vT9qbpdmKAzx1','g2Y2MEU9ag9J28Tpr6eSe','interested');
INSERT INTO "votes" VALUES('u-Sw46clt43hm22J-r9P5','3mH4jHlQFsffmSkAHe8DC','g2Y2MEU9ag9J28Tpr6eSe','skip');
INSERT INTO "votes" VALUES('qD7aVpTtB-7blb5FC5bOe','lompyy4dfmUO3N1vCHTpI','LqMrw2W4Q8rtgz6hOrr_h','maybe');
INSERT INTO "votes" VALUES('6NMHgyPz0Zbhf8mwmIqd-','ji38S3aoglBOZc0aPwUSH','LqMrw2W4Q8rtgz6hOrr_h','maybe');
INSERT INTO "votes" VALUES('9YVK4uSTqJB9CIUdTaSGg','2sEzH27DcQ6kstyn1Gjny','LqMrw2W4Q8rtgz6hOrr_h','skip');
INSERT INTO "votes" VALUES('5eGRfOQpuhvE3v60nWk2q','8rhOqtPVHgfnalTM1hYx6','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('PbKENnGYsFjAToJlI-a2y','SyxcIDrH3euzlwiZlpfjo','LqMrw2W4Q8rtgz6hOrr_h','interested');
INSERT INTO "votes" VALUES('YGX165z4LZlAc8hxTLGPr','31AjqCtJGl6V24loAsoYx','LqMrw2W4Q8rtgz6hOrr_h','maybe');
INSERT INTO "votes" VALUES('px0-spmMgvT3_VAJU9zSK','Odpn-eQJ9X3tKoUWx3HAh','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('nykQH0_dIfLH5rvutUAvH','8rhOqtPVHgfnalTM1hYx6','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('G-c3Vu1TjJUka7CG6e1W-','AXCjmtv06asHkXpI82hNu','xadk-um1OLVQWW470yALm','maybe');
INSERT INTO "votes" VALUES('5IKvxii3IGN-gUHQ3NH4c','31AjqCtJGl6V24loAsoYx','xadk-um1OLVQWW470yALm','interested');
INSERT INTO "votes" VALUES('AJ0PYlVDQ7vj92AgniBEm','8rhOqtPVHgfnalTM1hYx6','hUXi67irZFzKskSGBzqIE','maybe');
INSERT INTO "votes" VALUES('qxC0Vq_fg97Iv1gMwqeGM','SyxcIDrH3euzlwiZlpfjo','hUXi67irZFzKskSGBzqIE','interested');
INSERT INTO "votes" VALUES('EssNVLVWxJtUpuBZQsCaZ','AXCjmtv06asHkXpI82hNu','hUXi67irZFzKskSGBzqIE','interested');
INSERT INTO "votes" VALUES('GvsUtXIbmNzwfjWVWyyXl','j66WwaIyXuqRLD8i2n84f','hUXi67irZFzKskSGBzqIE','skip');
INSERT INTO "votes" VALUES('ruAoBQwZxHeCLjszZpiGt','unY7SfK1vT9qbpdmKAzx1','hUXi67irZFzKskSGBzqIE','skip');
INSERT INTO "votes" VALUES('DCbt0CdSfuUIlVw6cvEKK','uC0luPhFpnhkJ7rsjolsR','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('mcnevL2RuuJXwWd7iGc1Q','ji38S3aoglBOZc0aPwUSH','FeIrMPprVHhS50rMvgVLd','maybe');
INSERT INTO "votes" VALUES('F-oKQgQzg5EOLeBETUhfM','2sEzH27DcQ6kstyn1Gjny','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('QSKui9Pdg1kQNn7qMgD25','j66WwaIyXuqRLD8i2n84f','FeIrMPprVHhS50rMvgVLd','interested');
INSERT INTO "votes" VALUES('EeGoPNMywa9jGPFesBc1e','Q44c6XXdPyHN0n0jHZuaT','FeIrMPprVHhS50rMvgVLd','skip');
INSERT INTO "votes" VALUES('_OQMfQGls6NdZ-3SXL7hO','hxlFtu_R6mN2PxCo4UhWf','KyxxptSs-hAFIaAIBYwqo','skip');
INSERT INTO "votes" VALUES('twUXMPMshDiQc8hSFcp4P','uC0luPhFpnhkJ7rsjolsR','KyxxptSs-hAFIaAIBYwqo','maybe');
INSERT INTO "votes" VALUES('OuMwP7xgcq9rkBdFR8pEc','hAnnqs7WweE28dDpwm4h5','KyxxptSs-hAFIaAIBYwqo','skip');
INSERT INTO "votes" VALUES('_KPn2OhDoHuqiemx0Kzul','8rhOqtPVHgfnalTM1hYx6','KyxxptSs-hAFIaAIBYwqo','interested');
INSERT INTO "votes" VALUES('w4Npk4ifrO30nAOXLqdRR','AXCjmtv06asHkXpI82hNu','KyxxptSs-hAFIaAIBYwqo','skip');
INSERT INTO "votes" VALUES('C9iQM75JE8ntinaZp0qAR','unY7SfK1vT9qbpdmKAzx1','KyxxptSs-hAFIaAIBYwqo','skip');
INSERT INTO "votes" VALUES('AksYq3qd_MaSN0Q2-5j-0','XtMzz15sjim3vRCLv4c9y','KyxxptSs-hAFIaAIBYwqo','maybe');
INSERT INTO "votes" VALUES('QmaIn_QuXXy5D-u2OYVPH','uC0luPhFpnhkJ7rsjolsR','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('XaEpRQ4QIvvELk6l-0VJO','DAwFh6FR0NR0BNSXCzy7K','nbvsqreGd-qltpMrQMgUj','interested');
INSERT INTO "votes" VALUES('mSP0srnQRBlvMzAHyEDQg','SyxcIDrH3euzlwiZlpfjo','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('TPJK_L6MaRm4JNGXZCBul','b__vtFYuRTJ8cJm0mn_vP','nbvsqreGd-qltpMrQMgUj','interested');
INSERT INTO "votes" VALUES('TeKcd7lOneDX4ScMuE3aa','jrJxUJToRW-iZmPZs6RIl','nbvsqreGd-qltpMrQMgUj','skip');
INSERT INTO "votes" VALUES('05f4IgPXaW2l_cwCzAiMK','31AjqCtJGl6V24loAsoYx','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('FCW9qeCCaOAlKo5ddx-Rm','3mH4jHlQFsffmSkAHe8DC','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('xNZW7tgKcr8fJbb19VW0C','XtMzz15sjim3vRCLv4c9y','nbvsqreGd-qltpMrQMgUj','maybe');
INSERT INTO "votes" VALUES('jsdZWeAsotY-1D1uTyBC1','hxlFtu_R6mN2PxCo4UhWf','q1J2GxzP0jcxIVSUeNEW8','skip');
INSERT INTO "votes" VALUES('c-3pQtdhKlVlbchlUpGab','uC0luPhFpnhkJ7rsjolsR','q1J2GxzP0jcxIVSUeNEW8','interested');
INSERT INTO "votes" VALUES('wxHd_w2EnENIGlQ14XLLN','Odpn-eQJ9X3tKoUWx3HAh','q1J2GxzP0jcxIVSUeNEW8','maybe');
INSERT INTO "votes" VALUES('M1MznXgL4j4TRPBDeJmIM','jrJxUJToRW-iZmPZs6RIl','q1J2GxzP0jcxIVSUeNEW8','interested');
INSERT INTO "votes" VALUES('o4B-q2KvEN4eoOqeAlZ-J','AXCjmtv06asHkXpI82hNu','q1J2GxzP0jcxIVSUeNEW8','maybe');
INSERT INTO "votes" VALUES('MJ3QueU83NqfswgIey3Pf','j66WwaIyXuqRLD8i2n84f','q1J2GxzP0jcxIVSUeNEW8','maybe');
INSERT INTO "votes" VALUES('HwNJ47Rfbee1KYNzaksm2','31AjqCtJGl6V24loAsoYx','q1J2GxzP0jcxIVSUeNEW8','maybe');
INSERT INTO "votes" VALUES('71O2BUgN5b9kayvhSYRjo','hxlFtu_R6mN2PxCo4UhWf','jFXpawOxJ84YUQ1QeUdax','interested');
INSERT INTO "votes" VALUES('w5nyRPd3Bbg1Zk7MkQtyM','lompyy4dfmUO3N1vCHTpI','jFXpawOxJ84YUQ1QeUdax','interested');
INSERT INTO "votes" VALUES('7xJohqJmNOjS-Ynh5-DKN','2sEzH27DcQ6kstyn1Gjny','jFXpawOxJ84YUQ1QeUdax','skip');
INSERT INTO "votes" VALUES('oYXZZuojqGVK4MxsX6zxL','Odpn-eQJ9X3tKoUWx3HAh','jFXpawOxJ84YUQ1QeUdax','skip');
INSERT INTO "votes" VALUES('RbT3crsauP0WpzBDmHnIO','8rhOqtPVHgfnalTM1hYx6','jFXpawOxJ84YUQ1QeUdax','maybe');
INSERT INTO "votes" VALUES('GQV8Rw5cwMdRN7BskAlsk','b__vtFYuRTJ8cJm0mn_vP','jFXpawOxJ84YUQ1QeUdax','skip');
INSERT INTO "votes" VALUES('ex6-b8t67dJfBwvrtHOkj','3mH4jHlQFsffmSkAHe8DC','jFXpawOxJ84YUQ1QeUdax','interested');
INSERT INTO "votes" VALUES('g50LtA2VXGglqbKYBTKI2','uC0luPhFpnhkJ7rsjolsR','B6LlBxVXBcCTj4yw_syvn','maybe');
INSERT INTO "votes" VALUES('N_ng6_QZKPjYi1uT6pqje','2sEzH27DcQ6kstyn1Gjny','B6LlBxVXBcCTj4yw_syvn','skip');
INSERT INTO "votes" VALUES('rL7M6CiYt8bifEpvnMfAJ','Odpn-eQJ9X3tKoUWx3HAh','B6LlBxVXBcCTj4yw_syvn','skip');
INSERT INTO "votes" VALUES('a9VlsixH1ZcvaInSc68iA','8rhOqtPVHgfnalTM1hYx6','B6LlBxVXBcCTj4yw_syvn','maybe');
INSERT INTO "votes" VALUES('YJHzPFxcZ1Ki77lWaFkOj','SyxcIDrH3euzlwiZlpfjo','B6LlBxVXBcCTj4yw_syvn','maybe');
INSERT INTO "votes" VALUES('-v0FMLbp98Z1zp5YNJTOL','unY7SfK1vT9qbpdmKAzx1','B6LlBxVXBcCTj4yw_syvn','interested');
INSERT INTO "votes" VALUES('-RLu4-34PZ_g_d0Lp6JsP','3mH4jHlQFsffmSkAHe8DC','B6LlBxVXBcCTj4yw_syvn','interested');
INSERT INTO "votes" VALUES('7zTUvnUCRIkCxsv7WXnbT','DAwFh6FR0NR0BNSXCzy7K','joBV_Xbwxsri3Yx8LlPiH','maybe');
INSERT INTO "votes" VALUES('5Aj5ffTc07M2CzgM-kYyg','ji38S3aoglBOZc0aPwUSH','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('b1-HXZ8Mj46cNJMMzgxO_','2sEzH27DcQ6kstyn1Gjny','joBV_Xbwxsri3Yx8LlPiH','maybe');
INSERT INTO "votes" VALUES('xp82Nh_HP1FrEOfitRG_K','8rhOqtPVHgfnalTM1hYx6','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('D8NzfKZchXaveHbxWJcet','b__vtFYuRTJ8cJm0mn_vP','joBV_Xbwxsri3Yx8LlPiH','maybe');
INSERT INTO "votes" VALUES('DOiXd4Xg4S6dqkkqg2sL4','Q44c6XXdPyHN0n0jHZuaT','joBV_Xbwxsri3Yx8LlPiH','interested');
INSERT INTO "votes" VALUES('Ah8R_ppSE3iMbGmyeW3e9','DAwFh6FR0NR0BNSXCzy7K','bFc2AxCyHQ5JmK0AOC-3k','maybe');
INSERT INTO "votes" VALUES('vKBbiib-wY9vP8YNcip3E','lompyy4dfmUO3N1vCHTpI','bFc2AxCyHQ5JmK0AOC-3k','interested');
INSERT INTO "votes" VALUES('LZOvyXVcOL9IPrahlTzgb','ji38S3aoglBOZc0aPwUSH','bFc2AxCyHQ5JmK0AOC-3k','skip');
INSERT INTO "votes" VALUES('f6tV-3CFx7sMx4G4gbJEp','2sEzH27DcQ6kstyn1Gjny','bFc2AxCyHQ5JmK0AOC-3k','maybe');
INSERT INTO "votes" VALUES('q8dCoU9EsiWosjTkIIapQ','Odpn-eQJ9X3tKoUWx3HAh','bFc2AxCyHQ5JmK0AOC-3k','skip');
INSERT INTO "votes" VALUES('jdPAet1Kldeajr67OFZth','SyxcIDrH3euzlwiZlpfjo','bFc2AxCyHQ5JmK0AOC-3k','interested');
INSERT INTO "votes" VALUES('ybDxbZpZd-nLqpfC961ZE','b__vtFYuRTJ8cJm0mn_vP','bFc2AxCyHQ5JmK0AOC-3k','interested');
INSERT INTO "votes" VALUES('AL5gUk8ZfBU8xQQa4GLI7','jrJxUJToRW-iZmPZs6RIl','bFc2AxCyHQ5JmK0AOC-3k','interested');
INSERT INTO "votes" VALUES('ctQ9uecC67AZDdB1-D_Jt','Q44c6XXdPyHN0n0jHZuaT','bFc2AxCyHQ5JmK0AOC-3k','skip');
INSERT INTO "votes" VALUES('vGYuB0AhSwkph_ioxtBFt','XtMzz15sjim3vRCLv4c9y','bFc2AxCyHQ5JmK0AOC-3k','maybe');
INSERT INTO "votes" VALUES('xe6-gYYzw0u4Azd5tQCmE','hxlFtu_R6mN2PxCo4UhWf','71eYkQyF2gtMVzNEz4Ceg','skip');
INSERT INTO "votes" VALUES('jefAO7dGENc0aOnwuhJ49','ji38S3aoglBOZc0aPwUSH','71eYkQyF2gtMVzNEz4Ceg','skip');
INSERT INTO "votes" VALUES('H-_h1NHbrbNgHF3HzdOgh','2sEzH27DcQ6kstyn1Gjny','71eYkQyF2gtMVzNEz4Ceg','maybe');
INSERT INTO "votes" VALUES('jeGypubm-Kzjg6eIJ2lVR','hAnnqs7WweE28dDpwm4h5','71eYkQyF2gtMVzNEz4Ceg','maybe');
INSERT INTO "votes" VALUES('suwRw5dD84ghchu90DTCF','b__vtFYuRTJ8cJm0mn_vP','71eYkQyF2gtMVzNEz4Ceg','interested');
INSERT INTO "votes" VALUES('VzkV8II5HSChGbEKT05B4','3mH4jHlQFsffmSkAHe8DC','71eYkQyF2gtMVzNEz4Ceg','skip');
INSERT INTO "votes" VALUES('RENgcgpRZWD-5PSTT2WAa','XtMzz15sjim3vRCLv4c9y','71eYkQyF2gtMVzNEz4Ceg','skip');
INSERT INTO "votes" VALUES('EX3zo53Xg2US1mLu9V8IR','uC0luPhFpnhkJ7rsjolsR','BS_eMdb5qYIj_yExay5QI','interested');
INSERT INTO "votes" VALUES('igNgr4wXvd2cvGO4l1uEm','DAwFh6FR0NR0BNSXCzy7K','BS_eMdb5qYIj_yExay5QI','maybe');
INSERT INTO "votes" VALUES('z4FSiwTZ7PDHCQfxSa4TF','XtMzz15sjim3vRCLv4c9y','BS_eMdb5qYIj_yExay5QI','maybe');
INSERT INTO "votes" VALUES('_mCzPijYYNHgT3bL1A7wx','uC0luPhFpnhkJ7rsjolsR','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('l7setCnqpLPrEF91uMKut','lompyy4dfmUO3N1vCHTpI','T_vMnJyje-liMbme_4Efb','interested');
INSERT INTO "votes" VALUES('ebP7ahD_Zg1pngd-X1wFY','ji38S3aoglBOZc0aPwUSH','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('cZOhPGzXMcbTLw1EiQTbu','2sEzH27DcQ6kstyn1Gjny','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('Mx-dyMZprdwY18bNwp25H','Odpn-eQJ9X3tKoUWx3HAh','T_vMnJyje-liMbme_4Efb','skip');
INSERT INTO "votes" VALUES('4hm7LKSn9bXPSmBkscGT5','unY7SfK1vT9qbpdmKAzx1','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('v-P44_Bi5YrlWwshE3hqY','Q44c6XXdPyHN0n0jHZuaT','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('1dILV_SpTFI6gW1THD6nS','31AjqCtJGl6V24loAsoYx','T_vMnJyje-liMbme_4Efb','skip');
INSERT INTO "votes" VALUES('lYijk66CdGJTpcGi7ZwuL','3mH4jHlQFsffmSkAHe8DC','T_vMnJyje-liMbme_4Efb','maybe');
INSERT INTO "votes" VALUES('KhNS5S_mxQmqqqOAoU0Qh','DAwFh6FR0NR0BNSXCzy7K','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('2u2k-nuqRf5eLJKtNj6OE','hAnnqs7WweE28dDpwm4h5','pccefhg_NrlvJHuVUIFHm','maybe');
INSERT INTO "votes" VALUES('sgO3VN_gOTJfDixj5oG4T','Odpn-eQJ9X3tKoUWx3HAh','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('PkZuW-w1Na2mQyIx1kSqs','8rhOqtPVHgfnalTM1hYx6','pccefhg_NrlvJHuVUIFHm','maybe');
INSERT INTO "votes" VALUES('IS_7VErQQJAjKTp4Sy_bj','SyxcIDrH3euzlwiZlpfjo','pccefhg_NrlvJHuVUIFHm','maybe');
INSERT INTO "votes" VALUES('Gra_0j2IFxAzwdJdh9WjE','AXCjmtv06asHkXpI82hNu','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('UqxPX52zYa8DbVzSpR-uS','unY7SfK1vT9qbpdmKAzx1','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('9iXhG8J1u1AyqmfBo5duu','Q44c6XXdPyHN0n0jHZuaT','pccefhg_NrlvJHuVUIFHm','interested');
INSERT INTO "votes" VALUES('BfIL7TvEcmmntg6dv2UcM','XtMzz15sjim3vRCLv4c9y','pccefhg_NrlvJHuVUIFHm','skip');
INSERT INTO "votes" VALUES('wH2RpoaHUVKQr0RI3pD_w','hxlFtu_R6mN2PxCo4UhWf','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('wf8b6qoJi0bU15Q-9sLN4','DAwFh6FR0NR0BNSXCzy7K','7_z70nuNqFlZXFLA76Ift','skip');
INSERT INTO "votes" VALUES('1bYl8uramiQ5LuPXJDVHd','SyxcIDrH3euzlwiZlpfjo','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('5r9ugCs-eTYumz-CvsTGf','AXCjmtv06asHkXpI82hNu','7_z70nuNqFlZXFLA76Ift','maybe');
INSERT INTO "votes" VALUES('-kG7-rIBxvZKxucIin-RE','3mH4jHlQFsffmSkAHe8DC','7_z70nuNqFlZXFLA76Ift','interested');
INSERT INTO "votes" VALUES('90SCRmHbKUd00Vvu6OGDC','hxlFtu_R6mN2PxCo4UhWf','WSSlq8biti-tqLOLCyJwc','interested');
INSERT INTO "votes" VALUES('XZsOTvaavXncHP7oBozOp','lompyy4dfmUO3N1vCHTpI','WSSlq8biti-tqLOLCyJwc','interested');
INSERT INTO "votes" VALUES('ufD_guvnOMAuVBLLwkvfI','2sEzH27DcQ6kstyn1Gjny','WSSlq8biti-tqLOLCyJwc','skip');
INSERT INTO "votes" VALUES('aRx87UlZJjDXmwa3orUdF','hAnnqs7WweE28dDpwm4h5','WSSlq8biti-tqLOLCyJwc','maybe');
INSERT INTO "votes" VALUES('7AIQteVvue2CwBC4CTRtQ','Odpn-eQJ9X3tKoUWx3HAh','WSSlq8biti-tqLOLCyJwc','maybe');
INSERT INTO "votes" VALUES('Y_mJ8wsnqL_QORb1f3ZSP','jrJxUJToRW-iZmPZs6RIl','WSSlq8biti-tqLOLCyJwc','interested');
INSERT INTO "votes" VALUES('FaE79LsFvlfssJCexmsDI','AXCjmtv06asHkXpI82hNu','WSSlq8biti-tqLOLCyJwc','interested');
INSERT INTO "votes" VALUES('H0EakDize6wMrpbSQjYef','uC0luPhFpnhkJ7rsjolsR','a17N0EkVvIliYoDwqyKG7','maybe');
INSERT INTO "votes" VALUES('Cll4e43JEkKZwBRDgINbF','ji38S3aoglBOZc0aPwUSH','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('RVxEi6c2qqYtLK0hjDT7g','2sEzH27DcQ6kstyn1Gjny','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('yxiK_8D_2W8t7nykG9XOJ','Odpn-eQJ9X3tKoUWx3HAh','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('cuNdplqTCxQGmTsHmKfQV','8rhOqtPVHgfnalTM1hYx6','a17N0EkVvIliYoDwqyKG7','maybe');
INSERT INTO "votes" VALUES('nA5_g1haP2Z4gL7pv8tzF','SyxcIDrH3euzlwiZlpfjo','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('YD0_I10IFWgl3l4MOstw5','b__vtFYuRTJ8cJm0mn_vP','a17N0EkVvIliYoDwqyKG7','skip');
INSERT INTO "votes" VALUES('pderF8WQmIQSp75jomgg5','j66WwaIyXuqRLD8i2n84f','a17N0EkVvIliYoDwqyKG7','maybe');
INSERT INTO "votes" VALUES('FQCsN0NLunX4PFdKhHkK7','Q44c6XXdPyHN0n0jHZuaT','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('4Q23EQaHlviJ-FcAoofkQ','XtMzz15sjim3vRCLv4c9y','a17N0EkVvIliYoDwqyKG7','interested');
INSERT INTO "votes" VALUES('CqwJayOt49dobitFc4r5N','SyxcIDrH3euzlwiZlpfjo','MuPXEoJa6zGQGTXZpqSLf','skip');
INSERT INTO "votes" VALUES('LeLoYXrs3g6jREI7z29QG','b__vtFYuRTJ8cJm0mn_vP','MuPXEoJa6zGQGTXZpqSLf','interested');
INSERT INTO "votes" VALUES('5afmj6me2yHC46BbUY0B2','jrJxUJToRW-iZmPZs6RIl','MuPXEoJa6zGQGTXZpqSLf','skip');
INSERT INTO "votes" VALUES('19mHZJD6Iy2K7nUByYYA4','j66WwaIyXuqRLD8i2n84f','MuPXEoJa6zGQGTXZpqSLf','maybe');
INSERT INTO "votes" VALUES('JE70FhbxqZWWv8MSHJe0I','unY7SfK1vT9qbpdmKAzx1','MuPXEoJa6zGQGTXZpqSLf','maybe');
INSERT INTO "votes" VALUES('orl49Vc1-4VcLftuNWgN0','31AjqCtJGl6V24loAsoYx','MuPXEoJa6zGQGTXZpqSLf','skip');
INSERT INTO "votes" VALUES('-gc1mIbLfW-OLMpyHdD_6','XtMzz15sjim3vRCLv4c9y','MuPXEoJa6zGQGTXZpqSLf','maybe');
INSERT INTO "votes" VALUES('8poL3F7KRLsaRGk2EAeyl','DAwFh6FR0NR0BNSXCzy7K','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('YsCaX-gnPmt5wMIt7hrj1','lompyy4dfmUO3N1vCHTpI','uGj9-HQqb3vnIv_juOw-C','interested');
INSERT INTO "votes" VALUES('Qw2NZpLNp300dt545U3Mp','ji38S3aoglBOZc0aPwUSH','uGj9-HQqb3vnIv_juOw-C','interested');
INSERT INTO "votes" VALUES('CB_RFsoYXVSmMYr0SYqkD','hAnnqs7WweE28dDpwm4h5','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('QHVAHXvebNkKie7u6Z3PB','Odpn-eQJ9X3tKoUWx3HAh','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('PV2f1C3o6bl_pQ6mWdObD','SyxcIDrH3euzlwiZlpfjo','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('-NaRjMW3nqj8t9OcPYOWm','jrJxUJToRW-iZmPZs6RIl','uGj9-HQqb3vnIv_juOw-C','interested');
INSERT INTO "votes" VALUES('nNy8nhNoJq5-xB-OLoGu-','3mH4jHlQFsffmSkAHe8DC','uGj9-HQqb3vnIv_juOw-C','maybe');
INSERT INTO "votes" VALUES('M62vEEa0T6CFZZMT4DgBc','hxlFtu_R6mN2PxCo4UhWf','NPO7h8xslD0uHfUC_Edb0','maybe');
INSERT INTO "votes" VALUES('LPJMFQuqBpXqMOYQNaiq2','uC0luPhFpnhkJ7rsjolsR','NPO7h8xslD0uHfUC_Edb0','maybe');
INSERT INTO "votes" VALUES('kgP7KlV31LjUfV5JBCXN7','Odpn-eQJ9X3tKoUWx3HAh','NPO7h8xslD0uHfUC_Edb0','interested');
INSERT INTO "votes" VALUES('vE4RyD0bAKzjeHzlGb_IW','b__vtFYuRTJ8cJm0mn_vP','NPO7h8xslD0uHfUC_Edb0','maybe');
INSERT INTO "votes" VALUES('4puDcTtUoJuMsTg-i09wc','jrJxUJToRW-iZmPZs6RIl','NPO7h8xslD0uHfUC_Edb0','maybe');
INSERT INTO "votes" VALUES('HTQRm3Ts55a1gPlw1nfMd','31AjqCtJGl6V24loAsoYx','NPO7h8xslD0uHfUC_Edb0','interested');
INSERT INTO "votes" VALUES('1yYKGan7iCf8g8mep7j-m','XtMzz15sjim3vRCLv4c9y','NPO7h8xslD0uHfUC_Edb0','interested');
INSERT INTO "votes" VALUES('KQu-bx6V48XGZGclzoLVQ','lompyy4dfmUO3N1vCHTpI','upEogf7diAZmjg-LBwFxb','skip');
INSERT INTO "votes" VALUES('CzeLNLv4nZqbCMJ7YLEux','2sEzH27DcQ6kstyn1Gjny','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('VLjD6E0PXS57U28x2Hm8D','8rhOqtPVHgfnalTM1hYx6','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('0r9cDPxYARKPzbIXG4inb','b__vtFYuRTJ8cJm0mn_vP','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('15xe7XC2LjTyjc0OuEOHB','j66WwaIyXuqRLD8i2n84f','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('sVKjrpJKGllhKERiiHvDT','Q44c6XXdPyHN0n0jHZuaT','upEogf7diAZmjg-LBwFxb','skip');
INSERT INTO "votes" VALUES('hffRYno2nH7L_7fEOyBSv','31AjqCtJGl6V24loAsoYx','upEogf7diAZmjg-LBwFxb','skip');
INSERT INTO "votes" VALUES('KOzp9lZKVY2zrAsAcvylC','3mH4jHlQFsffmSkAHe8DC','upEogf7diAZmjg-LBwFxb','interested');
INSERT INTO "votes" VALUES('qlhXjvm0sgWugRZ2p7bQr','XtMzz15sjim3vRCLv4c9y','upEogf7diAZmjg-LBwFxb','maybe');
INSERT INTO "votes" VALUES('piwflDB6DFCO4DwJLjdkS','hxlFtu_R6mN2PxCo4UhWf','X61pP6MpXPqB5bmJnR8OR','skip');
INSERT INTO "votes" VALUES('kT4lBBxS_OIIP2G9hsKvC','lompyy4dfmUO3N1vCHTpI','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('O3-ItBSvS9PCrKx22rCpf','hAnnqs7WweE28dDpwm4h5','X61pP6MpXPqB5bmJnR8OR','skip');
INSERT INTO "votes" VALUES('3Yr9Xw7VvSqTBIfKzX2pv','8rhOqtPVHgfnalTM1hYx6','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('A84F2BzyipQUCy04eohQ1','b__vtFYuRTJ8cJm0mn_vP','X61pP6MpXPqB5bmJnR8OR','maybe');
INSERT INTO "votes" VALUES('gkReh705Dtshr3SCq0JzQ','AXCjmtv06asHkXpI82hNu','X61pP6MpXPqB5bmJnR8OR','maybe');
INSERT INTO "votes" VALUES('5xcXrDN-OUVc68-fdwA03','unY7SfK1vT9qbpdmKAzx1','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('sWvaFIJjQxxPuta2DdRZY','3mH4jHlQFsffmSkAHe8DC','X61pP6MpXPqB5bmJnR8OR','interested');
INSERT INTO "votes" VALUES('9ERKJLuiBOSbWfXbv3cdh','hxlFtu_R6mN2PxCo4UhWf','JqQJB9R06rqD3wogvFy98','skip');
INSERT INTO "votes" VALUES('iUb88FrTuD9QcMNhBNWTX','DAwFh6FR0NR0BNSXCzy7K','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('w2ojIAB3N7Frq-CTrlTCX','SyxcIDrH3euzlwiZlpfjo','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('23mdqNsOvNDdvYIIRPJRK','jrJxUJToRW-iZmPZs6RIl','JqQJB9R06rqD3wogvFy98','skip');
INSERT INTO "votes" VALUES('fgg0WGoXQZvVO6u7vyVX5','j66WwaIyXuqRLD8i2n84f','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('qS9Pi_Af3yQiJb3ZRrojx','unY7SfK1vT9qbpdmKAzx1','JqQJB9R06rqD3wogvFy98','skip');
INSERT INTO "votes" VALUES('xQ6d-a9pb9ELrRk7fWflh','3mH4jHlQFsffmSkAHe8DC','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('VWNhYpN6t8vY5FUSEal4_','XtMzz15sjim3vRCLv4c9y','JqQJB9R06rqD3wogvFy98','interested');
INSERT INTO "votes" VALUES('4FjCCAwaON8xIIe57TSOP','uC0luPhFpnhkJ7rsjolsR','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('s-mfphcqrwT3_6ynHGmV3','DAwFh6FR0NR0BNSXCzy7K','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('7EEpxpJpSJ9Zl4friNftU','lompyy4dfmUO3N1vCHTpI','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('SdTiEbeTBwpABCmZ3dO-a','2sEzH27DcQ6kstyn1Gjny','YI7OKPnMbvhYn_vWxCj3o','skip');
INSERT INTO "votes" VALUES('B-DW4iTrgmuWBUOqYLnGO','8rhOqtPVHgfnalTM1hYx6','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('zjpNHpgLAvOvqk5dD0v6R','SyxcIDrH3euzlwiZlpfjo','YI7OKPnMbvhYn_vWxCj3o','maybe');
INSERT INTO "votes" VALUES('l9a7W_9X5rxRgFQlU27xx','b__vtFYuRTJ8cJm0mn_vP','YI7OKPnMbvhYn_vWxCj3o','interested');
INSERT INTO "votes" VALUES('k-WrvskmB7LWFJXHxITay','XtMzz15sjim3vRCLv4c9y','YI7OKPnMbvhYn_vWxCj3o','skip');
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
INSERT INTO "events" VALUES('8VLwEf5j4Auj3qP8uWboU','Conference Alpha','Conference-Alpha','Event currently in proposal phase','https://test-event-1.example.com','2026-11-13T12:08:33.683Z','2026-11-27T12:08:33.683Z','2026-11-27T12:08:33.683Z','2026-12-11T12:08:33.683Z','2026-12-11T12:08:33.683Z','2027-01-03T17:00:00.000Z',120,10,'Europe/Berlin','AcademicCapIcon',30,0,1,5,1,'open');
INSERT INTO "events" VALUES('4VuwmLxfL6ieouWsivJEG','Conference Beta','Conference-Beta','Event currently in **voting** phase — cast your votes and check the [event website](https://test-event-2.example.com) for updates.','https://test-event-2.example.com','2026-10-30T12:08:33.683Z','2026-11-13T12:08:33.683Z','2026-11-13T12:08:33.683Z','2026-11-27T12:08:33.683Z','2026-11-27T12:08:33.683Z','2026-12-20T17:00:00.000Z',120,10,'Europe/Berlin','BeakerIcon',30,0,1,5,1,'open');
INSERT INTO "events" VALUES('foRApMDpSFp9dWQORjUxi','Conference Gamma','Conference-Gamma','Event currently in **scheduling phase**.

### Quick links

- [Venue map](https://test-event-3.example.com/map)
- [Code of conduct](https://test-event-3.example.com/coc)','https://test-event-3.example.com','2026-10-16T11:08:33.683Z','2026-10-30T12:08:33.683Z','2026-10-30T12:08:33.683Z','2026-11-13T12:08:33.683Z','2026-11-13T12:08:33.683Z','2026-12-07T02:00:00.000Z',120,10,'Europe/Berlin','GlobeAltIcon',30,0,1,5,1,'open');
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
INSERT INTO "sessions" VALUES('T54QA-Bf2h8t3s2QstVIE','Opening Keynote - Conference Alpha','Welcome to Conference Alpha','2027-01-01T08:00:00.000Z','2027-01-01T09:30:00.000Z',100,1,0,0,NULL,'8VLwEf5j4Auj3qP8uWboU',NULL,1);
INSERT INTO "sessions" VALUES('wLZPjJoxV5Vu4qlEbjglC','Lunch Break','','2027-01-01T11:30:00.000Z','2027-01-01T13:00:00.000Z',0,1,1,0,NULL,'8VLwEf5j4Auj3qP8uWboU',NULL,1);
INSERT INTO "sessions" VALUES('Nh6OzLf_FYyo6A3AhozYL','Lunch Break','','2027-01-02T11:30:00.000Z','2027-01-02T13:00:00.000Z',0,1,1,0,NULL,'8VLwEf5j4Auj3qP8uWboU',NULL,1);
INSERT INTO "sessions" VALUES('Exi7tBFl1yBUZcDRNObxi','Lunch Break','','2027-01-03T11:30:00.000Z','2027-01-03T13:00:00.000Z',0,1,1,0,NULL,'8VLwEf5j4Auj3qP8uWboU',NULL,1);
INSERT INTO "sessions" VALUES('_ux43f25TE2LrYAkPv8Fw','Opening Keynote - Conference Beta','Welcome to Conference Beta','2026-12-18T08:00:00.000Z','2026-12-18T09:30:00.000Z',100,1,0,0,NULL,'4VuwmLxfL6ieouWsivJEG',NULL,1);
INSERT INTO "sessions" VALUES('mxV3Pmxhtr-SiTlAWxe14','Lunch Break','','2026-12-18T11:30:00.000Z','2026-12-18T13:00:00.000Z',0,1,1,0,NULL,'4VuwmLxfL6ieouWsivJEG',NULL,1);
INSERT INTO "sessions" VALUES('1WW_zjyQEQMNpQtZI1Fvo','Lunch Break','','2026-12-19T11:30:00.000Z','2026-12-19T13:00:00.000Z',0,1,1,0,NULL,'4VuwmLxfL6ieouWsivJEG',NULL,1);
INSERT INTO "sessions" VALUES('rYODcgmySq5uEN2kw6-ve','Lunch Break','','2026-12-20T11:30:00.000Z','2026-12-20T13:00:00.000Z',0,1,1,0,NULL,'4VuwmLxfL6ieouWsivJEG',NULL,1);
INSERT INTO "sessions" VALUES('LgNOFSCjrqHNnaOWryR0F','Opening Keynote - Conference Gamma','Welcome to Conference Gamma','2026-12-04T08:00:00.000Z','2026-12-04T09:30:00.000Z',100,1,0,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('i5AoZz7kj70-i2WskWIq_','Lunch Break','','2026-12-04T11:30:00.000Z','2026-12-04T13:00:00.000Z',0,1,1,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('uGrGreeYwDpBl6gQVmYWh','Lunch Break','','2026-12-05T11:30:00.000Z','2026-12-05T13:00:00.000Z',0,1,1,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('vwNAZUQECK2zLKA-JOnCf','Lunch Break','','2026-12-06T11:30:00.000Z','2026-12-06T13:00:00.000Z',0,1,1,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('KmoSJLHiE9zev6I5eaaoA','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT','2026-12-04T10:10:00.000Z','2026-12-04T11:00:00.000Z',100,0,0,0,'uC0luPhFpnhkJ7rsjolsR','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('s8wCZOrTgPIa0w0reY3vq','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort','2026-12-04T10:10:00.000Z','2026-12-04T11:30:00.000Z',30,0,0,1,'DAwFh6FR0NR0BNSXCzy7K','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('qtJYkVnjYL6zL__iFRatx','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.','2026-12-04T13:10:00.000Z','2026-12-04T14:00:00.000Z',100,0,0,0,'lompyy4dfmUO3N1vCHTpI','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('2UeU_HlQwPOyzW5BHgQwH','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.','2026-12-04T13:10:00.000Z','2026-12-04T14:30:00.000Z',25,0,0,0,'AXCjmtv06asHkXpI82hNu','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('CDGHJe5uMDYmMV04mqgLN','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.','2026-12-04T14:40:00.000Z','2026-12-04T15:30:00.000Z',30,0,0,0,'8rhOqtPVHgfnalTM1hYx6','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('U-ezQ4kayKG9G7URSSeV0','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.','2026-12-05T08:10:00.000Z','2026-12-05T09:00:00.000Z',100,0,0,0,'hxlFtu_R6mN2PxCo4UhWf','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('TUBFufFQGbU1Nx6-9enjn','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.','2026-12-05T09:10:00.000Z','2026-12-05T10:30:00.000Z',25,0,0,0,'SyxcIDrH3euzlwiZlpfjo','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('RUuVtpiD68iIomixc5fH2','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.','2026-12-05T09:40:00.000Z','2026-12-05T11:00:00.000Z',30,0,0,0,'jrJxUJToRW-iZmPZs6RIl','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('E5Zd_vpO-1ZRBMY47po_6','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.','2026-12-05T13:10:00.000Z','2026-12-05T14:00:00.000Z',100,0,0,0,'unY7SfK1vT9qbpdmKAzx1','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('fjeMDKAlU1KfClLbAWlKa','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.','2026-12-05T13:10:00.000Z','2026-12-05T14:00:00.000Z',25,0,0,0,'hAnnqs7WweE28dDpwm4h5','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('j80DFvceVL5TFSlogTa9w','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.','2026-12-05T15:10:00.000Z','2026-12-05T16:00:00.000Z',100,0,0,0,'Odpn-eQJ9X3tKoUWx3HAh','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('5tMkZYMNzzMlhaMDLiNKc','Hallway Track: CRDT Show & Tell','Impromptu session: I''ll demo a small real-time collaborative editor built on [CRDTs](https://crdt.tech) and we can poke at the edge cases together. Bring your laptop if you want to pair on it.

Added straight to the schedule because the hallway conversation got out of hand — *that''s what open scheduling is for!*','2026-12-05T15:10:00.000Z','2026-12-05T15:30:00.000Z',15,0,0,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('7bpFGV6IqiXAWYkxTwPFV','Evening Wrap-up','Loose ends and goodbyes before dinner.','2026-12-05T16:40:00.000Z','2026-12-05T17:00:00.000Z',100,0,0,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('RV_3ADNsluWJAB3Ok7fCR','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.','2026-12-06T08:10:00.000Z','2026-12-06T09:00:00.000Z',100,0,0,0,'2sEzH27DcQ6kstyn1Gjny','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('2NyfTzZolQvpUYiYhBPCb','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.','2026-12-06T09:10:00.000Z','2026-12-06T10:00:00.000Z',30,0,0,0,'b__vtFYuRTJ8cJm0mn_vP','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('7gsEuBv23DPkH4SEUxYl7','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.','2026-12-06T09:40:00.000Z','2026-12-06T10:30:00.000Z',25,0,0,0,'j66WwaIyXuqRLD8i2n84f','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('YFUv7A4FGIggnfGWzGQvB','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.','2026-12-06T13:10:00.000Z','2026-12-06T14:00:00.000Z',100,0,0,0,'ji38S3aoglBOZc0aPwUSH','foRApMDpSFp9dWQORjUxi',NULL,1);
INSERT INTO "sessions" VALUES('05WrtHQmlYNPYVQjrt-Ig','Closing Session & Farewell','Wrap-up of Conference Gamma:

- Community announcements
- A look back at the highlights of the last three days
- Thank-yous to volunteers and speakers
- A preview of next year''s edition

We close with a group photo in front of the **Main Hall**.','2026-12-06T15:10:00.000Z','2026-12-06T16:00:00.000Z',100,1,0,0,NULL,'foRApMDpSFp9dWQORjUxi',NULL,1);
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
INSERT INTO "comments" VALUES('QlBFer_6Fzxa0eKkj4XO0',NULL,NULL,'',1,'2026-11-20T02:08:34.911Z',NULL);
INSERT INTO "comments" VALUES('xxywm0gGQyiMMGSTUlaEk','qYrnpWvEbqovxJrU7-bLc','QlBFer_6Fzxa0eKkj4XO0','Good question — no background needed, I''ll start from scratch.',0,'2026-11-20T03:08:34.911Z',NULL);
INSERT INTO "comments" VALUES('hbMzZGYA-mrWPpYCKciYg','raOZ1cf9LCGm03lv8SNBl','xxywm0gGQyiMMGSTUlaEk','Perfect, count me in.',0,'2026-11-20T04:08:34.911Z',NULL);
INSERT INTO "comments" VALUES('WANTdqxQCOSDwAaFxUNgj','4m-IDZiT3aoidhMR42Rnf',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-20T05:08:34.911Z',NULL);
INSERT INTO "comments" VALUES('i1WcZlbffUe13KHBenov2','4m-IDZiT3aoidhMR42Rnf',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-20T02:22:34.911Z',NULL);
INSERT INTO "comments" VALUES('MqLd4XRjPljdXXCagCuxn','J4_Hfv_cYWR5PtJ2-fjB6',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-20T05:22:34.911Z',NULL);
INSERT INTO "comments" VALUES('2PIYkv-H2IWbT2Rgf10yG','fzuhG07KpzgjEWVvggiTq',NULL,'Could this be scheduled later in the day? It clashes with the workshop block.',0,'2026-11-20T02:36:34.911Z',NULL);
INSERT INTO "comments" VALUES('LYqYFSxBi5IGk5EHL4mtK','3CD4RABuWkAWuu2dgKnxs','2PIYkv-H2IWbT2Rgf10yG','Good question — no background needed, I''ll start from scratch.',0,'2026-11-20T03:36:34.911Z',NULL);
INSERT INTO "comments" VALUES('wgwNjvF_BaB2q18JmrA5e','fzuhG07KpzgjEWVvggiTq',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-20T02:50:34.911Z',NULL);
INSERT INTO "comments" VALUES('TtYAl8GatAPU1_4UZAemL','qYrnpWvEbqovxJrU7-bLc',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-20T02:08:34.911Z','2026-11-20T02:12:34.911Z');
INSERT INTO "comments" VALUES('o_sqsBnLSOXak9PA52dha','ZR_N3BysPeGSmkw1Sc6As','TtYAl8GatAPU1_4UZAemL','Good question — no background needed, I''ll start from scratch.',0,'2026-11-20T03:08:34.912Z',NULL);
INSERT INTO "comments" VALUES('rlmUqU61aBWnApwKRVFws','raOZ1cf9LCGm03lv8SNBl','o_sqsBnLSOXak9PA52dha','Perfect, count me in.',0,'2026-11-20T04:08:34.912Z',NULL);
INSERT INTO "comments" VALUES('ROvU5NpCwHsJP8nsy3Ttn','4m-IDZiT3aoidhMR42Rnf',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-20T05:08:34.912Z',NULL);
INSERT INTO "comments" VALUES('lWR23_0iOi2PUxe83uI6D','raOZ1cf9LCGm03lv8SNBl',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-20T02:22:34.912Z',NULL);
INSERT INTO "comments" VALUES('hyMUuxhJLBDXUoKnL5C7U','r2qBH1bBxh_WZFMnmpCem',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-20T02:57:34.912Z',NULL);
INSERT INTO "comments" VALUES('-YLEtBfEkF-rb8z6VxShE','A-2D3WcMxIxHkgCX-Zg6I','hyMUuxhJLBDXUoKnL5C7U','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-20T03:57:34.912Z',NULL);
INSERT INTO "comments" VALUES('GnZkX0_2Wx30tqjpGWUCb','xaIzAJf0ygp2RH0x9Q0a9','-YLEtBfEkF-rb8z6VxShE','That makes sense, thanks for explaining!',0,'2026-11-20T04:57:34.912Z',NULL);
INSERT INTO "comments" VALUES('GdT_X2gP0cnPptIN76wVj','ZR_N3BysPeGSmkw1Sc6As',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-20T02:15:34.913Z',NULL);
INSERT INTO "comments" VALUES('Hb7eCckq8Fbz6C3RWosA2','4m-IDZiT3aoidhMR42Rnf','GdT_X2gP0cnPptIN76wVj','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-20T03:15:34.913Z',NULL);
INSERT INTO "comments" VALUES('7mXB_1PyxZYB8jHHiwmz_','J4_Hfv_cYWR5PtJ2-fjB6',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-20T02:43:34.913Z','2026-11-20T02:47:34.913Z');
INSERT INTO "comments" VALUES('VIQTxyikzGceGKZUM0kzV','KyxxptSs-hAFIaAIBYwqo','7mXB_1PyxZYB8jHHiwmz_','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-20T03:43:34.913Z',NULL);
INSERT INTO "comments" VALUES('v_OS4zLbe4UwJ2x5-eiX4','fzuhG07KpzgjEWVvggiTq','VIQTxyikzGceGKZUM0kzV','That makes sense, thanks for explaining!',0,'2026-11-20T04:43:34.913Z',NULL);
INSERT INTO "comments" VALUES('ohBU0XZaOur3TzoOHZxuQ','fzuhG07KpzgjEWVvggiTq',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-20T02:50:34.913Z',NULL);
INSERT INTO "comments" VALUES('cnMGtrUnRgxgAq_UwicPW','jFXpawOxJ84YUQ1QeUdax','ohBU0XZaOur3TzoOHZxuQ','I''d rather keep them separate, they go in quite different directions.',0,'2026-11-20T03:50:34.913Z',NULL);
INSERT INTO "comments" VALUES('ZqFb8fXq05l9hdiOStoya','r2qBH1bBxh_WZFMnmpCem','cnMGtrUnRgxgAq_UwicPW','Perfect, count me in.',0,'2026-11-20T04:50:34.913Z',NULL);
INSERT INTO "comments" VALUES('5XYYYFluRd7YAsnCfoAr2','A-2D3WcMxIxHkgCX-Zg6I',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-20T05:50:34.913Z',NULL);
INSERT INTO "comments" VALUES('8RGzVtUaKa1VJ-vv2eZIa','A-2D3WcMxIxHkgCX-Zg6I',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-20T03:04:34.913Z',NULL);
INSERT INTO "comments" VALUES('f65LV7QPHRpUaTvYy0wZi','lmWswbXj1DPwV1PbJJrUs',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-20T03:18:34.913Z','2026-11-20T03:22:34.913Z');
INSERT INTO "comments" VALUES('-tPtPPxePvHmcxpQB4uDC','lmWswbXj1DPwV1PbJJrUs',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-20T03:25:34.913Z',NULL);
INSERT INTO "comments" VALUES('KbcwS1E6fMdgL8pF5dEFH','65nHCLlKwYqVTPhyJbvb0',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-20T03:32:34.913Z',NULL);
INSERT INTO "comments" VALUES('10V8hI8HuvadDGI-dezFF','NPO7h8xslD0uHfUC_Edb0','KbcwS1E6fMdgL8pF5dEFH','Good question — no background needed, I''ll start from scratch.',0,'2026-11-20T04:32:34.913Z',NULL);
INSERT INTO "comments" VALUES('3oycsr0LsUIj7HOICBL6y','fR7_6ZapXcBdI1nhPgQdJ','10V8hI8HuvadDGI-dezFF','Perfect, count me in.',0,'2026-11-20T05:32:34.913Z',NULL);
INSERT INTO "comments" VALUES('8qWTUDDtbnPjjrFvhqlqg','LqMrw2W4Q8rtgz6hOrr_h',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-20T03:53:34.913Z','2026-11-20T03:57:34.913Z');
INSERT INTO "comments" VALUES('cwKiDRmcgwOWfuiBV-mYr','uGj9-HQqb3vnIv_juOw-C','8qWTUDDtbnPjjrFvhqlqg','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-20T04:53:34.913Z',NULL);
INSERT INTO "comments" VALUES('XpMoUxMmvePMh2ZTSy-Eh','hUXi67irZFzKskSGBzqIE',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-20T06:53:34.913Z',NULL);
INSERT INTO "comments" VALUES('YKNpBlAVJqtNLvGkFHV4b','hUXi67irZFzKskSGBzqIE',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-20T04:07:34.913Z',NULL);
INSERT INTO "comments" VALUES('vvpmDwNDThTJzGjRB13S-','FeIrMPprVHhS50rMvgVLd',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-20T04:14:34.913Z',NULL);
INSERT INTO "comments" VALUES('zZzYx-SNimClXXaCdz05J','4m-IDZiT3aoidhMR42Rnf',NULL,'Who else is on the panel?',0,'2026-11-20T07:08:34.913Z',NULL);
INSERT INTO "comments" VALUES('1PRR28Djfu8e863vjlZPz','3CD4RABuWkAWuu2dgKnxs','zZzYx-SNimClXXaCdz05J','I''d like to join.',0,'2026-11-20T08:08:34.913Z',NULL);
INSERT INTO "comments" VALUES('UTZSWan1JUgIzO3HBOoWy','J4_Hfv_cYWR5PtJ2-fjB6','zZzYx-SNimClXXaCdz05J','So would I.',0,'2026-11-20T09:08:34.913Z',NULL);
CREATE TABLE `proposal_comments` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_comments" VALUES('QlBFer_6Fzxa0eKkj4XO0','clVCkL8I0Vk5YGXYd4gNr');
INSERT INTO "proposal_comments" VALUES('xxywm0gGQyiMMGSTUlaEk','clVCkL8I0Vk5YGXYd4gNr');
INSERT INTO "proposal_comments" VALUES('hbMzZGYA-mrWPpYCKciYg','clVCkL8I0Vk5YGXYd4gNr');
INSERT INTO "proposal_comments" VALUES('WANTdqxQCOSDwAaFxUNgj','clVCkL8I0Vk5YGXYd4gNr');
INSERT INTO "proposal_comments" VALUES('i1WcZlbffUe13KHBenov2','puuZsrEB3ZFyic9-8mYjw');
INSERT INTO "proposal_comments" VALUES('MqLd4XRjPljdXXCagCuxn','puuZsrEB3ZFyic9-8mYjw');
INSERT INTO "proposal_comments" VALUES('2PIYkv-H2IWbT2Rgf10yG','f-NOa7TCf4YUVaqeaDKSu');
INSERT INTO "proposal_comments" VALUES('LYqYFSxBi5IGk5EHL4mtK','f-NOa7TCf4YUVaqeaDKSu');
INSERT INTO "proposal_comments" VALUES('wgwNjvF_BaB2q18JmrA5e','pGx_2eZ4JE5SsOuDSPBwM');
INSERT INTO "proposal_comments" VALUES('TtYAl8GatAPU1_4UZAemL','sYUuJSPjIUyfj54pVkNgv');
INSERT INTO "proposal_comments" VALUES('o_sqsBnLSOXak9PA52dha','sYUuJSPjIUyfj54pVkNgv');
INSERT INTO "proposal_comments" VALUES('rlmUqU61aBWnApwKRVFws','sYUuJSPjIUyfj54pVkNgv');
INSERT INTO "proposal_comments" VALUES('ROvU5NpCwHsJP8nsy3Ttn','sYUuJSPjIUyfj54pVkNgv');
INSERT INTO "proposal_comments" VALUES('lWR23_0iOi2PUxe83uI6D','4n_lh6jyZiq7SoYmKPV9e');
INSERT INTO "proposal_comments" VALUES('hyMUuxhJLBDXUoKnL5C7U','zUoA-D9upaLYWBBF6Cmmu');
INSERT INTO "proposal_comments" VALUES('-YLEtBfEkF-rb8z6VxShE','zUoA-D9upaLYWBBF6Cmmu');
INSERT INTO "proposal_comments" VALUES('GnZkX0_2Wx30tqjpGWUCb','zUoA-D9upaLYWBBF6Cmmu');
INSERT INTO "proposal_comments" VALUES('GdT_X2gP0cnPptIN76wVj','uC0luPhFpnhkJ7rsjolsR');
INSERT INTO "proposal_comments" VALUES('Hb7eCckq8Fbz6C3RWosA2','uC0luPhFpnhkJ7rsjolsR');
INSERT INTO "proposal_comments" VALUES('7mXB_1PyxZYB8jHHiwmz_','2sEzH27DcQ6kstyn1Gjny');
INSERT INTO "proposal_comments" VALUES('VIQTxyikzGceGKZUM0kzV','2sEzH27DcQ6kstyn1Gjny');
INSERT INTO "proposal_comments" VALUES('v_OS4zLbe4UwJ2x5-eiX4','2sEzH27DcQ6kstyn1Gjny');
INSERT INTO "proposal_comments" VALUES('ohBU0XZaOur3TzoOHZxuQ','hAnnqs7WweE28dDpwm4h5');
INSERT INTO "proposal_comments" VALUES('cnMGtrUnRgxgAq_UwicPW','hAnnqs7WweE28dDpwm4h5');
INSERT INTO "proposal_comments" VALUES('ZqFb8fXq05l9hdiOStoya','hAnnqs7WweE28dDpwm4h5');
INSERT INTO "proposal_comments" VALUES('5XYYYFluRd7YAsnCfoAr2','hAnnqs7WweE28dDpwm4h5');
INSERT INTO "proposal_comments" VALUES('8RGzVtUaKa1VJ-vv2eZIa','8rhOqtPVHgfnalTM1hYx6');
INSERT INTO "proposal_comments" VALUES('f65LV7QPHRpUaTvYy0wZi','b__vtFYuRTJ8cJm0mn_vP');
INSERT INTO "proposal_comments" VALUES('-tPtPPxePvHmcxpQB4uDC','jrJxUJToRW-iZmPZs6RIl');
INSERT INTO "proposal_comments" VALUES('KbcwS1E6fMdgL8pF5dEFH','AXCjmtv06asHkXpI82hNu');
INSERT INTO "proposal_comments" VALUES('10V8hI8HuvadDGI-dezFF','AXCjmtv06asHkXpI82hNu');
INSERT INTO "proposal_comments" VALUES('3oycsr0LsUIj7HOICBL6y','AXCjmtv06asHkXpI82hNu');
INSERT INTO "proposal_comments" VALUES('8qWTUDDtbnPjjrFvhqlqg','Q44c6XXdPyHN0n0jHZuaT');
INSERT INTO "proposal_comments" VALUES('cwKiDRmcgwOWfuiBV-mYr','Q44c6XXdPyHN0n0jHZuaT');
INSERT INTO "proposal_comments" VALUES('XpMoUxMmvePMh2ZTSy-Eh','Q44c6XXdPyHN0n0jHZuaT');
INSERT INTO "proposal_comments" VALUES('YKNpBlAVJqtNLvGkFHV4b','3mH4jHlQFsffmSkAHe8DC');
INSERT INTO "proposal_comments" VALUES('vvpmDwNDThTJzGjRB13S-','XtMzz15sjim3vRCLv4c9y');
INSERT INTO "proposal_comments" VALUES('zZzYx-SNimClXXaCdz05J','F2egEnS2UMcrnXVaCvBxO');
INSERT INTO "proposal_comments" VALUES('1PRR28Djfu8e863vjlZPz','F2egEnS2UMcrnXVaCvBxO');
INSERT INTO "proposal_comments" VALUES('UTZSWan1JUgIzO3HBOoWy','F2egEnS2UMcrnXVaCvBxO');
CREATE TABLE `comment_likes` (
	`comment_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`created_time` text NOT NULL,
	PRIMARY KEY(`comment_id`, `guest_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "comment_likes" VALUES('xxywm0gGQyiMMGSTUlaEk','raOZ1cf9LCGm03lv8SNBl','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('hbMzZGYA-mrWPpYCKciYg','4m-IDZiT3aoidhMR42Rnf','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('hbMzZGYA-mrWPpYCKciYg','3CD4RABuWkAWuu2dgKnxs','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('hbMzZGYA-mrWPpYCKciYg','J4_Hfv_cYWR5PtJ2-fjB6','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('WANTdqxQCOSDwAaFxUNgj','3CD4RABuWkAWuu2dgKnxs','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('WANTdqxQCOSDwAaFxUNgj','J4_Hfv_cYWR5PtJ2-fjB6','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('i1WcZlbffUe13KHBenov2','J4_Hfv_cYWR5PtJ2-fjB6','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('i1WcZlbffUe13KHBenov2','fzuhG07KpzgjEWVvggiTq','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('MqLd4XRjPljdXXCagCuxn','fzuhG07KpzgjEWVvggiTq','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('MqLd4XRjPljdXXCagCuxn','r2qBH1bBxh_WZFMnmpCem','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('MqLd4XRjPljdXXCagCuxn','A-2D3WcMxIxHkgCX-Zg6I','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('2PIYkv-H2IWbT2Rgf10yG','r2qBH1bBxh_WZFMnmpCem','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('LYqYFSxBi5IGk5EHL4mtK','A-2D3WcMxIxHkgCX-Zg6I','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('wgwNjvF_BaB2q18JmrA5e','aVzBIlBaG-Y1BhSMk8zuy','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('wgwNjvF_BaB2q18JmrA5e','xaIzAJf0ygp2RH0x9Q0a9','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('TtYAl8GatAPU1_4UZAemL','xaIzAJf0ygp2RH0x9Q0a9','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('rlmUqU61aBWnApwKRVFws','65nHCLlKwYqVTPhyJbvb0','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('rlmUqU61aBWnApwKRVFws','fR7_6ZapXcBdI1nhPgQdJ','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('rlmUqU61aBWnApwKRVFws','g2Y2MEU9ag9J28Tpr6eSe','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('ROvU5NpCwHsJP8nsy3Ttn','fR7_6ZapXcBdI1nhPgQdJ','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('ROvU5NpCwHsJP8nsy3Ttn','g2Y2MEU9ag9J28Tpr6eSe','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('lWR23_0iOi2PUxe83uI6D','g2Y2MEU9ag9J28Tpr6eSe','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('lWR23_0iOi2PUxe83uI6D','LqMrw2W4Q8rtgz6hOrr_h','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('lWR23_0iOi2PUxe83uI6D','xadk-um1OLVQWW470yALm','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('hyMUuxhJLBDXUoKnL5C7U','LqMrw2W4Q8rtgz6hOrr_h','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('hyMUuxhJLBDXUoKnL5C7U','xadk-um1OLVQWW470yALm','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('GnZkX0_2Wx30tqjpGWUCb','hUXi67irZFzKskSGBzqIE','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('GdT_X2gP0cnPptIN76wVj','FeIrMPprVHhS50rMvgVLd','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('GdT_X2gP0cnPptIN76wVj','KyxxptSs-hAFIaAIBYwqo','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('GdT_X2gP0cnPptIN76wVj','nbvsqreGd-qltpMrQMgUj','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('Hb7eCckq8Fbz6C3RWosA2','KyxxptSs-hAFIaAIBYwqo','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('7mXB_1PyxZYB8jHHiwmz_','nbvsqreGd-qltpMrQMgUj','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('7mXB_1PyxZYB8jHHiwmz_','q1J2GxzP0jcxIVSUeNEW8','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('7mXB_1PyxZYB8jHHiwmz_','jFXpawOxJ84YUQ1QeUdax','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('VIQTxyikzGceGKZUM0kzV','q1J2GxzP0jcxIVSUeNEW8','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('VIQTxyikzGceGKZUM0kzV','jFXpawOxJ84YUQ1QeUdax','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('v_OS4zLbe4UwJ2x5-eiX4','jFXpawOxJ84YUQ1QeUdax','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('ohBU0XZaOur3TzoOHZxuQ','B6LlBxVXBcCTj4yw_syvn','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('cnMGtrUnRgxgAq_UwicPW','joBV_Xbwxsri3Yx8LlPiH','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('ZqFb8fXq05l9hdiOStoya','bFc2AxCyHQ5JmK0AOC-3k','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('ZqFb8fXq05l9hdiOStoya','71eYkQyF2gtMVzNEz4Ceg','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('ZqFb8fXq05l9hdiOStoya','BS_eMdb5qYIj_yExay5QI','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('5XYYYFluRd7YAsnCfoAr2','71eYkQyF2gtMVzNEz4Ceg','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('5XYYYFluRd7YAsnCfoAr2','BS_eMdb5qYIj_yExay5QI','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('8RGzVtUaKa1VJ-vv2eZIa','BS_eMdb5qYIj_yExay5QI','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('8RGzVtUaKa1VJ-vv2eZIa','T_vMnJyje-liMbme_4Efb','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('8RGzVtUaKa1VJ-vv2eZIa','pccefhg_NrlvJHuVUIFHm','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('f65LV7QPHRpUaTvYy0wZi','T_vMnJyje-liMbme_4Efb','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('8qWTUDDtbnPjjrFvhqlqg','MuPXEoJa6zGQGTXZpqSLf','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('cwKiDRmcgwOWfuiBV-mYr','MuPXEoJa6zGQGTXZpqSLf','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('cwKiDRmcgwOWfuiBV-mYr','NPO7h8xslD0uHfUC_Edb0','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('XpMoUxMmvePMh2ZTSy-Eh','NPO7h8xslD0uHfUC_Edb0','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('YKNpBlAVJqtNLvGkFHV4b','upEogf7diAZmjg-LBwFxb','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('zZzYx-SNimClXXaCdz05J','JqQJB9R06rqD3wogvFy98','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('zZzYx-SNimClXXaCdz05J','YI7OKPnMbvhYn_vWxCj3o','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('zZzYx-SNimClXXaCdz05J','qYrnpWvEbqovxJrU7-bLc','2026-11-20T11:06:34.913Z');
INSERT INTO "comment_likes" VALUES('1PRR28Djfu8e863vjlZPz','YI7OKPnMbvhYn_vWxCj3o','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('UTZSWan1JUgIzO3HBOoWy','qYrnpWvEbqovxJrU7-bLc','2026-11-20T11:08:34.913Z');
INSERT INTO "comment_likes" VALUES('UTZSWan1JUgIzO3HBOoWy','ZR_N3BysPeGSmkw1Sc6As','2026-11-20T11:07:34.913Z');
INSERT INTO "comment_likes" VALUES('UTZSWan1JUgIzO3HBOoWy','raOZ1cf9LCGm03lv8SNBl','2026-11-20T11:06:34.913Z');
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
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-01T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-02T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','qYrnpWvEbqovxJrU7-bLc','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','4m-IDZiT3aoidhMR42Rnf','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','fzuhG07KpzgjEWVvggiTq','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','aVzBIlBaG-Y1BhSMk8zuy','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','65nHCLlKwYqVTPhyJbvb0','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','LqMrw2W4Q8rtgz6hOrr_h','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','FeIrMPprVHhS50rMvgVLd','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','q1J2GxzP0jcxIVSUeNEW8','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','joBV_Xbwxsri3Yx8LlPiH','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','BS_eMdb5qYIj_yExay5QI','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','7_z70nuNqFlZXFLA76Ift','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','MuPXEoJa6zGQGTXZpqSLf','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','upEogf7diAZmjg-LBwFxb','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('8VLwEf5j4Auj3qP8uWboU','YI7OKPnMbvhYn_vWxCj3o','2027-01-03T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-18T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-19T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','qYrnpWvEbqovxJrU7-bLc','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','4m-IDZiT3aoidhMR42Rnf','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','fzuhG07KpzgjEWVvggiTq','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','aVzBIlBaG-Y1BhSMk8zuy','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','65nHCLlKwYqVTPhyJbvb0','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','LqMrw2W4Q8rtgz6hOrr_h','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','FeIrMPprVHhS50rMvgVLd','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','q1J2GxzP0jcxIVSUeNEW8','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','joBV_Xbwxsri3Yx8LlPiH','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','BS_eMdb5qYIj_yExay5QI','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','7_z70nuNqFlZXFLA76Ift','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','MuPXEoJa6zGQGTXZpqSLf','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','upEogf7diAZmjg-LBwFxb','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('4VuwmLxfL6ieouWsivJEG','YI7OKPnMbvhYn_vWxCj3o','2026-12-20T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-04T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-05T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','qYrnpWvEbqovxJrU7-bLc','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','4m-IDZiT3aoidhMR42Rnf','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','fzuhG07KpzgjEWVvggiTq','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','aVzBIlBaG-Y1BhSMk8zuy','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','65nHCLlKwYqVTPhyJbvb0','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','LqMrw2W4Q8rtgz6hOrr_h','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','FeIrMPprVHhS50rMvgVLd','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','q1J2GxzP0jcxIVSUeNEW8','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','joBV_Xbwxsri3Yx8LlPiH','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','MuPXEoJa6zGQGTXZpqSLf','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','upEogf7diAZmjg-LBwFxb','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','2026-12-06T15:30:00.000Z');
CREATE TABLE `meeting_points` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_index` integer DEFAULT 0 NOT NULL, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meeting_points" VALUES('1VNGmKA2xDC6VqfplHMKA','8VLwEf5j4Auj3qP8uWboU','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('EGt4aiVHse_bgGxlSlMLM','8VLwEf5j4Auj3qP8uWboU','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('5DPFjv6z6_jywMe4QIpHI','4VuwmLxfL6ieouWsivJEG','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('vOP321mIhl4E8VijdxzZE','4VuwmLxfL6ieouWsivJEG','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('X4L-kSpUTbn3RBmHKPWbL','foRApMDpSFp9dWQORjUxi','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('OrJqBWHE3-i5Uhf4Q1mbQ','foRApMDpSFp9dWQORjUxi','Garden bench','Behind the kitchen, weather permitting.',1,1);
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
INSERT INTO "meetings" VALUES('Aeh93GzEpkWZWC1VoA1Wv','foRApMDpSFp9dWQORjUxi','YI7OKPnMbvhYn_vWxCj3o','a17N0EkVvIliYoDwqyKG7','2026-12-04T09:00:00.000Z','2026-12-04T09:30:00.000Z','Coffee bar','Container queries, and where they still bite.','accepted','2026-11-20T12:08:35.323Z','2026-11-20T12:08:35.323Z','');
INSERT INTO "meetings" VALUES('o_W5sj2tESjywTwvFa597','foRApMDpSFp9dWQORjUxi','BS_eMdb5qYIj_yExay5QI','a17N0EkVvIliYoDwqyKG7','2026-12-04T09:00:00.000Z','2026-12-04T09:30:00.000Z','Garden bench','Could I steal you for the same half hour?','pending','2026-11-20T12:08:35.323Z',NULL,'');
INSERT INTO "meetings" VALUES('GYMzwi3R37QbvpyBAiHc4','foRApMDpSFp9dWQORjUxi','pccefhg_NrlvJHuVUIFHm','a17N0EkVvIliYoDwqyKG7','2026-12-04T10:00:00.000Z','2026-12-04T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-20T12:08:35.323Z',NULL,'');
INSERT INTO "meetings" VALUES('RRcZu7dsCXdiBpYdhDnjP','foRApMDpSFp9dWQORjUxi','7_z70nuNqFlZXFLA76Ift','a17N0EkVvIliYoDwqyKG7','2026-12-04T10:00:00.000Z','2026-12-04T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-20T12:08:35.323Z',NULL,'');
INSERT INTO "meetings" VALUES('I9pg37QDXVBRcr4aTCCwj','foRApMDpSFp9dWQORjUxi','WSSlq8biti-tqLOLCyJwc','a17N0EkVvIliYoDwqyKG7','2026-12-04T10:00:00.000Z','2026-12-04T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-20T12:08:35.323Z',NULL,'');
INSERT INTO "meetings" VALUES('UkDsnqskoNnGKyu7wHbXY','foRApMDpSFp9dWQORjUxi','a17N0EkVvIliYoDwqyKG7','MuPXEoJa6zGQGTXZpqSLf','2026-12-04T14:30:00.000Z','2026-12-04T15:00:00.000Z','Garden bench','Keen to hear how you run your platform team.','accepted','2026-11-20T12:08:35.323Z','2026-11-20T12:08:35.323Z','');
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
INSERT INTO "guests" VALUES('qYrnpWvEbqovxJrU7-bLc','Alice Test','alice@test.com','Frontend developer from Osaka. I love talking about **accessibility** and design systems — find me at the coffee machine.','She/Her','Osaka, Japan','[{"prompt":"Ask me about","answer":"Accessible design patterns and Japanese web typography"},{"prompt":"Offering","answer":"Code review swaps and coffee-machine debugging sessions"}]','["Japanese","English"]','[{"type":"website","value":"https://alice-test.example.com"},{"type":"telegram","value":"@alice_frontend"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/qYrnpWvEbqovxJrU7-bLc.webp?v=1795176513941','2026-11-20T09:08:33.941Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('ZR_N3BysPeGSmkw1Sc6As','Bob Test','bob@test.com','Product manager and community organizer from Lagos. I run a local meetup on inclusive product design and I''m always looking for speakers.','He/Him','Lagos, Nigeria','[{"prompt":"Looking for","answer":"Speakers for an inclusive product design meetup back home"},{"prompt":"Offering","answer":"Feedback on your product roadmap over coffee"}]','["English","Yoruba"]','[{"type":"email","value":"bob.organizes@example.com"},{"type":"whatsapp","value":"+234 801 234 5678"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/ZR_N3BysPeGSmkw1Sc6As.webp?v=1795176513944','2026-11-19T14:08:33.944Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('raOZ1cf9LCGm03lv8SNBl','Charlie Test','charlie@test.com','Data engineer from Guadalajara. Ask me about stream processing, or better yet, about my sourdough starter.','They/Them','Guadalajara, Mexico','[{"prompt":"Ask me about","answer":"Stream processing pipelines, or my sourdough starter"},{"prompt":"My weirdest skill","answer":"Naming Kafka topics that still make sense a year later"}]','["Spanish","English"]','[{"type":"discord","value":"charlie.streams"},{"type":"website","value":"https://charlie.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/raOZ1cf9LCGm03lv8SNBl.webp?v=1795176513944','2026-11-18T19:08:33.944Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('4m-IDZiT3aoidhMR42Rnf','Yuki Tanaka','yuki.tanaka@example.com',NULL,'He/Him',NULL,'[{"prompt":"Ask me about","answer":"Retro handheld consoles"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-18T00:08:33.944Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('3CD4RABuWkAWuu2dgKnxs','Amara Okafor','amara.okafor@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('J4_Hfv_cYWR5PtJ2-fjB6','Sofía Martínez','sofia.martinez@example.com',NULL,'She/Her',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-16T10:08:34.038Z',1,'scrypt$FjI3VfQkZNRyQKF3cv4toQ==$ATESXZES1E9bwTzVBuU9wfluhmBXjdCLb+Ba1Zvs2gI=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('fzuhG07KpzgjEWVvggiTq','Wei Chen','wei.chen@example.com','Platform engineer focused on developer experience.

Previously built CI tooling at a fintech startup in Shanghai. Ask me about `pipeline caching`.',NULL,'Shanghai, China','[{"prompt":"Ask me about","answer":"Build caching strategies that hold up under real CI load"}]','["Mandarin Chinese","English"]','[{"type":"telegram","value":"@weichen_dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/fzuhG07KpzgjEWVvggiTq.webp?v=1795176513947','2026-11-15T15:08:34.029Z',1,'scrypt$rXKHBYmmf+sd6b9NTgSqkg==$pu+sjlFqcsG1ODqb+qdQEHYYMitBiDSBHQTxlykHsws=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('r2qBH1bBxh_WZFMnmpCem','Priya Sharma','priya.sharma@example.com','ML researcher from Bengaluru working on **fairness in recommendation systems**.

*First time at this conference* — say hi if you see me wandering around looking lost!','She/Her','Bengaluru, India','[{"prompt":"Ask me about","answer":"Fairness metrics for recommender systems"},{"prompt":"Looking for","answer":"A conference buddy — this is my first time here!"}]','["Hindi","Kannada","English"]','[{"type":"website","value":"https://priyasharma.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/r2qBH1bBxh_WZFMnmpCem.webp?v=1795176513947','2026-11-14T20:08:33.947Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('A-2D3WcMxIxHkgCX-Zg6I','Lars Eriksson','lars.eriksson@example.com','Backend developer from Gothenburg. In rough order of enthusiasm:

- Rust
- saunas
- Kubernetes (reluctantly)','He/Him','Gothenburg, Sweden','[{"prompt":"Offering","answer":"Strong opinions about Rust, mild opinions about saunas"}]','["Swedish","English"]','[{"type":"signal","value":"lars.eriksson.99"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/A-2D3WcMxIxHkgCX-Zg6I.webp?v=1795176513947','2026-11-14T01:08:34.021Z',1,'scrypt$+wOM4pK2KVoTTWuXldSdpw==$PPSgtjZ9pTnFLR5HdT4K1ydhIGIs10Ui9HZ12BPkYV0=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('aVzBIlBaG-Y1BhSMk8zuy','Fatima Al-Farsi','fatima.alfarsi@example.com','Security engineer from Muscat. I break things *professionally* and fix them as a hobby. Happy to chat about threat modeling for small teams.',NULL,'Muscat, Oman','[{"prompt":"Ask me about","answer":"Threat modeling for teams too small to have a security hire"}]','["Arabic","English"]','[{"type":"email","value":"fatima.breaks.things@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/aVzBIlBaG-Y1BhSMk8zuy.webp?v=1795176513947','2026-11-13T06:08:34.058Z',1,'scrypt$dUkjaf26GiFVge181rKEcA==$HaIziX4ze4XHg/UBChWDDgw5oLPwEi8X3SHxleJOVZY=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('xaIzAJf0ygp2RH0x9Q0a9','Kwame Mensah','kwame.mensah@example.com','Founder of a small agritech company in Accra. Interested in offline-first apps and building for low-bandwidth environments.','He/Him','Accra, Ghana','[{"prompt":"Offering","answer":"War stories about building for 2G networks"}]','["Twi","English"]','[{"type":"whatsapp","value":"+233 24 555 0187"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/xaIzAJf0ygp2RH0x9Q0a9.webp?v=1795176513947','2026-11-12T11:08:34.063Z',1,'scrypt$d1d+C0ii2eM5QqI800ckEg==$dmKyqDFJjzx1xjjg/xn0GO5A0LkbC2dzfxI1X/XrosQ=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('lmWswbXj1DPwV1PbJJrUs','Hiroshi Yamamoto','hiroshi.yamamoto@example.com','Embedded systems engineer. I make LEDs blink for a living and I''m not ashamed of it.',NULL,'Yokohama, Japan','[{"prompt":"My weirdest skill","answer":"Debugging a blinking LED by ear"}]','["Japanese"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/lmWswbXj1DPwV1PbJJrUs.webp?v=1795176513947','2026-11-11T16:08:34.098Z',1,'scrypt$v+dG8rYuEGR8BU6Vr7bi0A==$1lGHycLAOj1PlvfzRUZ3sWWx3QuD1JWmr/XwxOIkCpg=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('65nHCLlKwYqVTPhyJbvb0','Aisha Diallo','aisha.diallo@example.com','UX researcher from Dakar, currently based in Berlin. I care deeply about research ethics and multilingual interfaces.','She/Her','Berlin, Germany','[{"prompt":"Ask me about","answer":"Research ethics for multilingual user studies"}]','["French","Wolof","English","German"]','[{"type":"website","value":"https://aishadiallo.example.com"},{"type":"other","label":"Mastodon","value":"@aisha@ux.social"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/65nHCLlKwYqVTPhyJbvb0.webp?v=1795176513947','2026-11-10T21:08:34.136Z',1,'scrypt$9eLfaIJvBmfusQjIXw3XKA==$9ntNgQlnnhWmhdwuO/npZu0RPsZwHRCyF+KVN9DVfq0=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('fR7_6ZapXcBdI1nhPgQdJ','Diego Fernández','diego.fernandez@example.com','Site reliability engineer from Buenos Aires. On-call survivor, incident retrospective enthusiast, tango dancer on weekends.',NULL,'Buenos Aires, Argentina','[{"prompt":"Offering","answer":"A rundown of the worst incident I ever caused, for entertainment purposes"}]','["Spanish","English"]','[{"type":"telegram","value":"@diego_sre"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/fR7_6ZapXcBdI1nhPgQdJ.webp?v=1795176513947','2026-11-10T02:08:34.127Z',1,'scrypt$z0GtDo6JMJB/nSTTK6P8tQ==$wI0rpzuhoLhuGjbYhKq40JfkP76uj/ExQp72l3OXNr0=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('g2Y2MEU9ag9J28Tpr6eSe','Mei-Ling Wu','meiling.wu@example.com','Technical writer from Taipei. I turn engineering mumbling into documentation people actually read.','She/Her','Taipei, Taiwan','[{"prompt":"Ask me about","answer":"Turning a wall of Slack threads into docs people read"}]','["Mandarin Chinese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/g2Y2MEU9ag9J28Tpr6eSe.webp?v=1795176513947','2026-11-09T07:08:34.121Z',1,'scrypt$eFdlyB/beHqs9QMBoz7zsA==$X6BszZMrfWLbhh3Rc7DZHHaoaH/U1vrdoF/zi7czuhw=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('LqMrw2W4Q8rtgz6hOrr_h','Olga Petrova','olga.petrova@example.com','Database internals nerd. If your query is slow I want to hear about it in excruciating detail.',NULL,'Novosibirsk, Russia','[{"prompt":"Offering","answer":"A very detailed opinion about your slow query, whether you want it or not"}]','["Russian","English"]','[{"type":"email","value":"olga.petrova.db@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/LqMrw2W4Q8rtgz6hOrr_h.webp?v=1795176513948','2026-11-08T12:08:34.133Z',1,'scrypt$OlLMhkTN9ppviZa7egRr1g==$fW+MFBr9ISi3PcBQ065Mnj0fyquwQ4pjw6kGLQmedyc=',NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('xadk-um1OLVQWW470yALm','Jean-Pierre Dubois','jeanpierre.dubois@example.com','Engineering manager from Lyon. Interested in sustainable pace, team topologies, and where to find decent cheese near the venue.','He/Him','Lyon, France','[{"prompt":"Looking for","answer":"Cheese recommendations near the venue"}]','["French","English"]','[{"type":"whatsapp","value":"+33 6 12 34 56 78"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/xadk-um1OLVQWW470yALm.webp?v=1795176513948','2026-11-07T17:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('hUXi67irZFzKskSGBzqIE','Thabo Ndlovu','thabo.ndlovu@example.com','Full-stack developer from Johannesburg working in civic tech. Building tools that help people navigate public services.',NULL,'Johannesburg, South Africa','[{"prompt":"Ask me about","answer":"Building civic tech that survives contact with real government data"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/hUXi67irZFzKskSGBzqIE.webp?v=1795176513948','2026-11-06T22:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('FeIrMPprVHhS50rMvgVLd','Anna Kowalska','anna.kowalska@example.com','QA engineer from Kraków. I find the bugs you swore were impossible.

Also: board game collector, **200+ and counting**.','She/Her','Kraków, Poland','[{"prompt":"Offering","answer":"Trades: I''ll find your worst bug for a board game recommendation"}]','["Polish","English"]','[{"type":"discord","value":"anna.qa"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/FeIrMPprVHhS50rMvgVLd.webp?v=1795176513948','2026-11-06T03:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('KyxxptSs-hAFIaAIBYwqo','Mohammed El-Sayed','mohammed.elsayed@example.com','Cloud architect from Cairo. Recovering microservices maximalist — ask me about the monolith we happily went back to.',NULL,'Cairo, Egypt','[{"prompt":"A hill I will die on","answer":"Boring architecture beats clever architecture, every time"}]','["Arabic","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/KyxxptSs-hAFIaAIBYwqo.webp?v=1795176513948','2026-11-05T08:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('nbvsqreGd-qltpMrQMgUj','Isabella Rossi','isabella.rossi@example.com','Design lead from Milan. I bridge the gap between Figma and production, one design token at a time.','She/Her','Milan, Italy','[{"prompt":"Ask me about","answer":"Getting design tokens to survive contact with production"}]','["English","French"]','[{"type":"website","value":"https://isabellarossi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/nbvsqreGd-qltpMrQMgUj.webp?v=1795176513948','2026-11-04T13:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('q1J2GxzP0jcxIVSUeNEW8','Min-jun Kim','minjun.kim@example.com','Game developer from Seoul, moonlighting in web tech. Fascinated by real-time collaboration and CRDTs.','They/Them','Seoul, South Korea','[{"prompt":"Currently obsessed with","answer":"CRDTs, and why conflict-free replication is harder than it sounds"}]','["Korean","English"]','[{"type":"discord","value":"minjunkim"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/q1J2GxzP0jcxIVSUeNEW8.webp?v=1795176513948','2026-11-03T18:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('jFXpawOxJ84YUQ1QeUdax','Carlos Silva','carlos.silva@example.com','DevOps engineer from Porto. I automate myself out of a job roughly once a year and somehow still have one.',NULL,'Porto, Portugal','[{"prompt":"Offering","answer":"A talk about automating yourself out of a job, repeatedly"}]','["Portuguese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/jFXpawOxJ84YUQ1QeUdax.webp?v=1795176513948','2026-11-02T23:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('B6LlBxVXBcCTj4yw_syvn','Nadia Haddad','nadia.haddad@example.com','Mobile developer from Beirut. Flutter by day, native by necessity. Organizer of a local women-in-tech mentoring circle.','She/Her','Beirut, Lebanon','[{"prompt":"Looking for","answer":"Mentors and mentees for a women-in-tech circle back home"}]','["Arabic","French","English"]','[{"type":"other","label":"Instagram","value":"@nadia.builds"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-02T04:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('joBV_Xbwxsri3Yx8LlPiH','Freya Nielsen','freya.nielsen@example.com','Accessibility consultant from Copenhagen. Screen reader power user. I will happily audit your conference talk slides.',NULL,'Copenhagen, Denmark','[{"prompt":"Offering","answer":"A free accessibility pass on your slides — bring your laptop"}]','["Danish","English"]','[{"type":"email","value":"freya.a11y@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-01T09:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('bFc2AxCyHQ5JmK0AOC-3k','Arjun Nair','arjun.nair@example.com','Distributed systems engineer from Kochi. Currently obsessed with consensus protocols and filter coffee, in that order.','He/Him','Kochi, India','[{"prompt":"Currently obsessed with","answer":"Consensus protocols, and where filter coffee ranks among them"}]','["Malayalam","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-31T14:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('71eYkQyF2gtMVzNEz4Ceg','Elif Yılmaz','elif.yilmaz@example.com','Computer science student from Istanbul, here on a scholarship ticket. Excited about everything, please recommend me sessions!',NULL,'Istanbul, Turkey','[{"prompt":"Looking for","answer":"Session recommendations — I''m new here and excited about everything"}]','["Turkish","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-30T19:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('BS_eMdb5qYIj_yExay5QI','Samuel Adeyemi','samuel.adeyemi@example.com','Backend engineer from Ibadan working on payment infrastructure across West Africa.',NULL,'Ibadan, Nigeria',NULL,'["Yoruba","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-30T00:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('T_vMnJyje-liMbme_4Efb','Linh Nguyen','linh.nguyen@example.com','Freelance web developer from Ho Chi Minh City. Jamstack fan, static site generator connoisseur, occasional conference speaker.','They/Them','Ho Chi Minh City, Vietnam','[{"prompt":"Offering","answer":"Static site generator recommendations, unsolicited and opinionated"}]','["Vietnamese","English"]','[{"type":"telegram","value":"@linh_jamstack"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-29T05:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('pccefhg_NrlvJHuVUIFHm','Marta Horvat','marta.horvat@example.com','Agile coach from Zagreb. Yes, we can talk about whether estimates are worth it. No, we won''t agree.',NULL,'Zagreb, Croatia','[{"prompt":"A hill I will die on","answer":"Estimates are a communication tool, not a promise"}]','["Croatian","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-28T10:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('7_z70nuNqFlZXFLA76Ift','Dmitri Volkov','dmitri.volkov@example.com','Compiler engineer. I read language specs for fun and I''m told this is concerning.',NULL,NULL,'[{"prompt":"My weirdest skill","answer":"Reading language specs for fun, apparently"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-27T15:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('WSSlq8biti-tqLOLCyJwc','Chiara Bianchi','chiara.bianchi@example.com','Data scientist from Bologna working in public health. Interested in reproducible research and open data.','She/Her','Bologna, Italy','[{"prompt":"Ask me about","answer":"Making public health research reproducible without a data team"}]',NULL,'[{"type":"website","value":"https://chiarabianchi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-26T20:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('a17N0EkVvIliYoDwqyKG7','Zanele Khumalo','zanele.khumalo@example.com','Frontend developer from Durban. CSS is my love language. Currently deep-diving into container queries.',NULL,'Durban, South Africa','[{"prompt":"Offering","answer":"Container query wizardry, upon request"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-26T01:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('MuPXEoJa6zGQGTXZpqSLf','Rafael Souza','rafael.souza@example.com','Engineering lead from São Paulo. I care about:

1. Mentoring junior devs
2. Building teams where questions are welcome
3. Coffee, not necessarily in that order',NULL,'São Paulo, Brazil','[{"prompt":"Offering","answer":"Mentoring conversations for junior devs finding their footing"}]','["Portuguese","English"]','[{"type":"website","value":"https://rafaelsouza.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-25T06:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('uGj9-HQqb3vnIv_juOw-C','Hana Kobayashi','hana.kobayashi@example.com','# Hi, I''m Hana!

Developer advocate based in Kyoto. I write tutorials, give talks, and collect conference stickers *competitively*.','She/Her','Kyoto, Japan','[{"prompt":"I collect","answer":"Conference stickers, competitively"}]','["Japanese","English"]','[{"type":"website","value":"https://hanakobayashi.example.com"},{"type":"other","label":"Bluesky","value":"@hanak.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/uGj9-HQqb3vnIv_juOw-C.webp?v=1795176513948','2026-10-24T11:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('NPO7h8xslD0uHfUC_Edb0','Tereza Nováková','tereza.novakova@example.com','Open source maintainer from Prague — see [my projects](https://github.example.com/tereza). Ask me about sustainable maintainership, or just send `git help`, either works.',NULL,'Prague, Czechia','[{"prompt":"Ask me about","answer":"Sustainable maintainership for projects that outlive their funding"}]','["Czech","English"]','[{"type":"website","value":"https://github.example.com/tereza"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-23T16:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('upEogf7diAZmjg-LBwFxb','Ahmad Karimi','ahmad.karimi@example.com','Software engineer from Tehran, now in Amsterdam. Working on developer tooling and learning Dutch, slowly.','He/Him','Amsterdam, Netherlands','[{"prompt":"Currently obsessed with","answer":"Developer tooling, and slowly learning Dutch"}]','["Persian","Dutch","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-22T21:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('X61pP6MpXPqB5bmJnR8OR','Maria Papadopoulou','maria.papadopoulou@example.com','Tech lead from Thessaloniki. Legacy code whisperer. Strong opinions on testing, loosely held on everything else.',NULL,'Thessaloniki, Greece','[{"prompt":"Offering","answer":"Loosely held opinions on everything except testing"}]','["Greek","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-22T02:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('JqQJB9R06rqD3wogvFy98','Mateo Quispe','mateo.quispe@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('YI7OKPnMbvhYn_vWxCj3o','Leilani Kahale','leilani.kahale@example.com',NULL,'She/They',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-20T12:08:33.948Z',0,NULL,NULL,NULL,0,1,1);
INSERT INTO "guests" VALUES('B4wq1dYSQcArkKK0kO9AC','Site Admin','site.admin@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,1,'scrypt$z67IIkTi8lXUDoIfChl1sg==$RFIr11GT9uf52E/5D7e53GvID38dPwwhDYexIyVFxNA=','site-admin',NULL,1,1,1);
CREATE TABLE `session_marks` (
	`guest_id` text NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`guest_id`, `session_id`),
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
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
