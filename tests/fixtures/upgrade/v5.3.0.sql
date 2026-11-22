-- Seeded database of schellingboard v5.3.0, dumped by
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
INSERT INTO "__drizzle_migrations" VALUES(NULL,'7a78fa49f71d30851bb719a17128e497b4514d4eeae968f29fc25c5348629404',1794318259045);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'acbf745b477fb18aa92cc200984dc7115cafb0701c712720c71294c1bf800d1c',1794322007551);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'05dad03b0df02a3982659da701764e1fb99631272daaf1ab51bf44007be0f596',1794336801027);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'e9dc42666b19ae748468f951ca33109cfa182dc46c01ca948bd7eb459c82659a',1794386637006);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'33ffcd28c428b55307d14bc41f4f9008ec20ed60c5a65825d484ddf390f940bf',1794395424057);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'d2af4db4435554adbdd8ebe31bbd4a27a09af7dec4fea45e3fc455f9df7818d3',1794496142703);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'915c8b98eefbaa74521e9e67d8f73e716736a40a1fffb396848835bb2c6bd3bd',1794555233168);
INSERT INTO "__drizzle_migrations" VALUES(NULL,'5b219cf21af6b12a04181ed7a628c15d6eb0e02aa6624d793785abb347ac6536',1794561853726);
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
INSERT INTO "days" VALUES('GcwA2kZXpVNRz6xwwcXWX','2026-12-13T08:00:00.000Z','2026-12-13T17:00:00.000Z','2026-12-13T08:00:00.000Z','2026-12-13T16:30:00.000Z','tCNQtXjwgJKS47DHOu32C',1);
INSERT INTO "days" VALUES('mr0gKtN7Vju1X7mBvhMNa','2026-12-14T08:00:00.000Z','2026-12-14T17:00:00.000Z','2026-12-14T08:00:00.000Z','2026-12-14T16:30:00.000Z','tCNQtXjwgJKS47DHOu32C',1);
INSERT INTO "days" VALUES('tzjMm-gocfLR0kw_-jl6R','2026-12-15T08:00:00.000Z','2026-12-15T17:00:00.000Z','2026-12-15T08:00:00.000Z','2026-12-15T16:30:00.000Z','tCNQtXjwgJKS47DHOu32C',1);
INSERT INTO "days" VALUES('xPoyambrmFA1v6S-yEw_t','2026-12-10T08:00:00.000Z','2026-12-10T17:00:00.000Z','2026-12-10T08:00:00.000Z','2026-12-10T16:30:00.000Z','y74c07QXIkssDeblYsOSY',1);
INSERT INTO "days" VALUES('oHMMWvZ15FTklRmXN8k5X','2026-12-11T08:00:00.000Z','2026-12-11T17:00:00.000Z','2026-12-11T08:00:00.000Z','2026-12-11T16:30:00.000Z','y74c07QXIkssDeblYsOSY',1);
INSERT INTO "days" VALUES('OXLWceJOQTGDuEXE-bMfR','2026-12-12T08:00:00.000Z','2026-12-12T17:00:00.000Z','2026-12-12T08:00:00.000Z','2026-12-12T16:30:00.000Z','y74c07QXIkssDeblYsOSY',1);
INSERT INTO "days" VALUES('ZrjrOCZma-GLivrk320KY','2026-12-06T08:00:00.000Z','2026-12-06T17:00:00.000Z','2026-12-06T08:00:00.000Z','2026-12-06T16:30:00.000Z','PPGDvamTBn3-mmtGaFpIs',1);
INSERT INTO "days" VALUES('-zLiB9qouXhJWu3eHtrqV','2026-12-07T08:00:00.000Z','2026-12-07T17:00:00.000Z','2026-12-07T08:00:00.000Z','2026-12-07T16:30:00.000Z','PPGDvamTBn3-mmtGaFpIs',1);
INSERT INTO "days" VALUES('plOsEqb-kS7xexJVcfBvG','2026-12-08T08:00:00.000Z','2026-12-09T02:00:00.000Z','2026-12-08T08:00:00.000Z','2026-12-09T01:30:00.000Z','PPGDvamTBn3-mmtGaFpIs',1);
CREATE TABLE "event_guests" (
	`event_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `guest_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','653Laslo-7HV4UdR60VwR');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "event_guests" VALUES('tCNQtXjwgJKS47DHOu32C','wMHGn7M3J3QFNXb0hnVAI');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','653Laslo-7HV4UdR60VwR');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "event_guests" VALUES('y74c07QXIkssDeblYsOSY','wMHGn7M3J3QFNXb0hnVAI');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','653Laslo-7HV4UdR60VwR');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "event_guests" VALUES('PPGDvamTBn3-mmtGaFpIs','wMHGn7M3J3QFNXb0hnVAI');
CREATE TABLE "event_locations" (
	`event_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `location_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-main-hall');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-room-a');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-room-b');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-library');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-boardroom');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-auditorium');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-courtyard');
INSERT INTO "event_locations" VALUES('tCNQtXjwgJKS47DHOu32C','loc-rooftop');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-main-hall');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-room-a');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-room-b');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-library');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-boardroom');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-auditorium');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-courtyard');
INSERT INTO "event_locations" VALUES('y74c07QXIkssDeblYsOSY','loc-rooftop');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-main-hall');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-room-a');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-room-b');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-library');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-boardroom');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-auditorium');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-courtyard');
INSERT INTO "event_locations" VALUES('PPGDvamTBn3-mmtGaFpIs','loc-rooftop');
CREATE TABLE "proposal_hosts" (
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`proposal_id`, `guest_id`),
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_hosts" VALUES('1WxnaHjmzL-MrFXqoga12','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "proposal_hosts" VALUES('jfVWtciMXay_FusYKq4iy','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('dqrBAvUJuyMrPACrjWWce','B861fQQuYzBhd-Mocc33H');
INSERT INTO "proposal_hosts" VALUES('i_B-1i-hdFFMOe-xrJ70B','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "proposal_hosts" VALUES('i_B-1i-hdFFMOe-xrJ70B','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "proposal_hosts" VALUES('q9-xnEACfepKaax5ZL0-4','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "proposal_hosts" VALUES('q9-xnEACfepKaax5ZL0-4','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "proposal_hosts" VALUES('HOe8H19DZ187KFigxlLj7','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "proposal_hosts" VALUES('M9c4OihAxgT5mH8WhT2e2','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "proposal_hosts" VALUES('qxnaSWeCZVJ_x7uhYXUM2','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "proposal_hosts" VALUES('5du-tM_03t9n7ntDybheh','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('WvU5O9bV8-VLx2HHDaA0O','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "proposal_hosts" VALUES('qgxfztgDGhigbvuxrRCks','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('PT4iarIt-AKQ-5g5euAK3','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "proposal_hosts" VALUES('PT4iarIt-AKQ-5g5euAK3','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "proposal_hosts" VALUES('7nCU-MBojH1a51wJTTfGU','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "proposal_hosts" VALUES('ik5U_5cRWPb2BQ-GFkfBn','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "proposal_hosts" VALUES('RNYAEFU56dvgZKrKXC_vB','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "proposal_hosts" VALUES('OZ-D_jct8LPqhsOt3kS3a','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "proposal_hosts" VALUES('OZ-D_jct8LPqhsOt3kS3a','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "proposal_hosts" VALUES('bE7HTUMnzDpQ3uQMNEkbw','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "proposal_hosts" VALUES('IW5fG9mUZ-34OCmxDsZdN','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "proposal_hosts" VALUES('YaLNTbhKL6VaCi28VEg1n','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('HiDJvL9tFRiNOXFWcPwr_','B861fQQuYzBhd-Mocc33H');
INSERT INTO "proposal_hosts" VALUES('LCEgZ0T55iEiW_TuM1zAX','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('kETG08fbq3ELygyL_r01I','B861fQQuYzBhd-Mocc33H');
INSERT INTO "proposal_hosts" VALUES('dqzoRjwwtXYo6Q_by8trQ','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "proposal_hosts" VALUES('3Fah_E9gWz_GfkuanoTRj','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "proposal_hosts" VALUES('BpCao3_JGp6jKtwibImZS','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "proposal_hosts" VALUES('No5bawBF0YyvML7baPlXm','B861fQQuYzBhd-Mocc33H');
INSERT INTO "proposal_hosts" VALUES('AGBEY_njyBy5Q7jRGUZYp','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "proposal_hosts" VALUES('1vmXq_aklEGRWiKfVvg_O','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "proposal_hosts" VALUES('4CL_x9jUBerrTq2nZic1y','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "proposal_hosts" VALUES('kIoZ2VvKhffSCGzA-UzVa','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "proposal_hosts" VALUES('TjgBSLfg16pMPiHRyE9Ex','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "proposal_hosts" VALUES('COVa7UWYU5frFHrOdbm3D','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "proposal_hosts" VALUES('vz9gIngxrD20xdhub4aTA','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "proposal_hosts" VALUES('eVa4GhsKkugwUOCZ5zXF0','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "proposal_hosts" VALUES('EXrWawC1luKRlZx5ikFrv','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "proposal_hosts" VALUES('Dbxx2Q_p7kPeOvtqJpxsY','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "proposal_hosts" VALUES('Dbxx2Q_p7kPeOvtqJpxsY','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "proposal_hosts" VALUES('ZKjvcX-vIAtHw2WhDDmxH','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "proposal_hosts" VALUES('7_a3qxw4M5vOCynSHpF7M','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "proposal_hosts" VALUES('ZuzR7zm-8hRB2t-BzRS26','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "proposal_hosts" VALUES('DiwkZNYszoJ4Y8u2zULZX','q4O1MRMpeQlO0TyrxQd_R');
CREATE TABLE "rsvps" (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "rsvps" VALUES('TWDzcudvLH0GfXuFhvNvJ','ci8dbP__5lb-1v9XB37OH','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('HA_4qV5DSuOy6ya14N2UK','elIqLxVtXYjoAR0h4JwC8','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('O4JLj4XIIm0-JrfMQFwKk','vBN4l6q78Ox-AZimbH8q1','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('0I6eNh-lYBrN0Yt4fABdl','GY5f2ud-7Kjyi03P9Ow9s','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('KbcuBhKEwgaHiwvh-5DJU','9p2Sdkum1k8-euhYqw0Um','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('ARNg02Agx9CC-fbuu_u-9','zU9Y4idODTfMl1uS7T71Z','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "rsvps" VALUES('q_cKXjN7DxmQ5-nQGLuKH','xQoXeTuPjMaLqtOWx41kB','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('i_dG2r-Aw-UJXqaJh_3RQ','MldbEEkJp5vkgrv4yi_f7','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('o_zkD_AF_uZ7FKi0eNf0o','V4fmvS7jwWLo-IuX5YCbC','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('1f7XcipB29JRjdaN458L9','eLf6ID4htstX9cjowYof6','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('Zl8kLqV41zTk1CEY0T-sZ','9p2Sdkum1k8-euhYqw0Um','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('xDBOCFK7U3rGLMDiyWJd4','nb6G9EYUZl_6Oc4b4e2yJ','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "rsvps" VALUES('1HdY0Svbv8PRYiEheXg55','vBN4l6q78Ox-AZimbH8q1','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "rsvps" VALUES('oYgfxLVGCRXgZcVT9U7eo','yo2ZXKdSg-4um_FxCGd31','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "rsvps" VALUES('qUYvhkEHoP50EFzspXJWh','lgOe1linCu89H6OwE_pGu','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "rsvps" VALUES('QCw4QrWTwInhuaYgMo18n','zU9Y4idODTfMl1uS7T71Z','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "rsvps" VALUES('e8LzK3L2PZe43tpOXI2jR','vBN4l6q78Ox-AZimbH8q1','B861fQQuYzBhd-Mocc33H');
INSERT INTO "rsvps" VALUES('wjL2blJ3fzR1p288ttjPR','V4fmvS7jwWLo-IuX5YCbC','B861fQQuYzBhd-Mocc33H');
INSERT INTO "rsvps" VALUES('Z-QipljxBLE_l7aAEbMIj','yo2ZXKdSg-4um_FxCGd31','B861fQQuYzBhd-Mocc33H');
INSERT INTO "rsvps" VALUES('mx5I1A7ZMm69ROVOSSE2T','N8q9N2O7e36NuFNsZrr6Q','B861fQQuYzBhd-Mocc33H');
INSERT INTO "rsvps" VALUES('ClddOjFShQvrMvx48paX9','nb6G9EYUZl_6Oc4b4e2yJ','B861fQQuYzBhd-Mocc33H');
INSERT INTO "rsvps" VALUES('m9Wd-wjv3w4lRB1ZxlDOE','ci8dbP__5lb-1v9XB37OH','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "rsvps" VALUES('4WY-dDkXHoAX990BINY8z','MldbEEkJp5vkgrv4yi_f7','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "rsvps" VALUES('OnRm83hcZ7b4S8G-shQIl','Z6OpYvFZ3ZwHV4BugTsTG','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "rsvps" VALUES('2lfaz0TtFZSDRlQG_PRMu','N8q9N2O7e36NuFNsZrr6Q','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "rsvps" VALUES('Hp4JVLNqdRe7BcsIdDSXL','o8RBJhhqnIprq0SPJ9zd3','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "rsvps" VALUES('DhsLjMqfMzFaZpoBYUH1G','ci8dbP__5lb-1v9XB37OH','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('nAUtur4xWXHfgLRhHDiNx','MldbEEkJp5vkgrv4yi_f7','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('zcSdjb9OAIdzFfZfVUuAs','V4fmvS7jwWLo-IuX5YCbC','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('p58-gq17crmYCU0blXnsM','yo2ZXKdSg-4um_FxCGd31','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('XdwJZz0WIHn4ywpd-4WG1','lgOe1linCu89H6OwE_pGu','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('OGGmrIwOCqbYRxh81ZOzt','mURCFTQRoGVOcIbG7DgeL','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('H7S9aHMDFR0MFaQlXbuqA','9p2Sdkum1k8-euhYqw0Um','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('hHx9IiWn3d-42qF21NKxd','nb6G9EYUZl_6Oc4b4e2yJ','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "rsvps" VALUES('3AUHZAIcYauYqM6-X8xxe','ci8dbP__5lb-1v9XB37OH','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('VjUSJyBZUrEmN77CbM5EL','vBN4l6q78Ox-AZimbH8q1','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('aJP35iYiPb1YWNRSDGbh1','V4fmvS7jwWLo-IuX5YCbC','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('QNKQCJ9rJwlWLuJ9J6DqH','mURCFTQRoGVOcIbG7DgeL','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('a1b6xaHp8U9VPzu7NqHg2','L48v8XqEAW88kwDHKtV6t','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('yDttxmpQUTW54RZbeBg6L','o8RBJhhqnIprq0SPJ9zd3','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "rsvps" VALUES('DQ8xWqZv-LidBy36ePqaV','ci8dbP__5lb-1v9XB37OH','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('swUsbNPq6mgFXwoB-NmOM','MldbEEkJp5vkgrv4yi_f7','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('UWma8ga1B2CKtvlrIbNqL','Z6OpYvFZ3ZwHV4BugTsTG','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('j7pfIk71b2qOaKweDs5Wa','GY5f2ud-7Kjyi03P9Ow9s','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('qy4aKnk421duTR9cJ6zBq','c5S2812xWzDKwJVAXdV1O','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('0WZpSt6QZXnbnTbWpi0Ij','zU9Y4idODTfMl1uS7T71Z','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "rsvps" VALUES('EfazWRtT7MN-rOj3T_46X','xQoXeTuPjMaLqtOWx41kB','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('gbI8dbBNTLeuDALVhMWVw','MldbEEkJp5vkgrv4yi_f7','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('NH8Q3eRwWPm_S0Lfa0u9M','Z6OpYvFZ3ZwHV4BugTsTG','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('t9zL0V_CSVw-Spg7BSdBE','eLf6ID4htstX9cjowYof6','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('waqiI_BU9A6vYIlXeKkBI','c5S2812xWzDKwJVAXdV1O','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('AhHLuoTwUfdv60qT5cwuM','zU9Y4idODTfMl1uS7T71Z','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "rsvps" VALUES('6ZQALWhC71FGdyC-qJrh5','MldbEEkJp5vkgrv4yi_f7','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "rsvps" VALUES('LYspW092DKs5H-RkTTuWG','eLf6ID4htstX9cjowYof6','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "rsvps" VALUES('GeRfp4_0O82evptfmGDJ8','lgOe1linCu89H6OwE_pGu','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "rsvps" VALUES('iGsrewZQ-yy8gLHDQeM-c','9p2Sdkum1k8-euhYqw0Um','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "rsvps" VALUES('w2aLqEEqnFk9Z_jF0xTyA','MldbEEkJp5vkgrv4yi_f7','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('8MuSVhrX71CAWB0x1PmK2','V4fmvS7jwWLo-IuX5YCbC','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('ZLn-uB5_CgYX_cjvXN4vS','eLf6ID4htstX9cjowYof6','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('MpOgRaqWb_RblYDAgjp-K','GY5f2ud-7Kjyi03P9Ow9s','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('ty-fI31KCypTnmacW3EgW','c5S2812xWzDKwJVAXdV1O','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('4a1PU8hjYVbBBi8R1Txli','L48v8XqEAW88kwDHKtV6t','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('60XLmw4QeBQt-PpJxIGM2','nb6G9EYUZl_6Oc4b4e2yJ','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "rsvps" VALUES('TMLULr9nbbIfwpLRZW5Ar','ci8dbP__5lb-1v9XB37OH','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('Z5rQfR2FwO3S-WIiXIkvb','elIqLxVtXYjoAR0h4JwC8','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('tUNDrdel8hPZaE8lyHJS3','yo2ZXKdSg-4um_FxCGd31','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('WoDLWsMJsYkzdkVrsdysT','lgOe1linCu89H6OwE_pGu','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('0ya2wcaD_p80mBmg5dUKm','GY5f2ud-7Kjyi03P9Ow9s','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('Z7vTzD3vNorvdw_kG-C1b','o8RBJhhqnIprq0SPJ9zd3','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('ojnANfdf11pRBZeBfV-zI','nb6G9EYUZl_6Oc4b4e2yJ','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "rsvps" VALUES('fl14klqb0OVCzroAkBfvv','ci8dbP__5lb-1v9XB37OH','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "rsvps" VALUES('Htj4_2FNEuGIySDQTS2tt','MldbEEkJp5vkgrv4yi_f7','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "rsvps" VALUES('KPYFK-FplG7uXO1Mfnvrh','nb6G9EYUZl_6Oc4b4e2yJ','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "rsvps" VALUES('VonaLXnfp7ITHA2RVDJYj','ci8dbP__5lb-1v9XB37OH','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "rsvps" VALUES('xWiMgKjyMtRxgY61o4gf9','L48v8XqEAW88kwDHKtV6t','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "rsvps" VALUES('vTwr6QeKl9nXR9lJPE1W1','zU9Y4idODTfMl1uS7T71Z','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "rsvps" VALUES('vij9hRaKXr5XctkfQsanV','ci8dbP__5lb-1v9XB37OH','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('Dj9kzXdaBmaS1-uvEZCLC','MldbEEkJp5vkgrv4yi_f7','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('zfqfvRu02u9RQ7LxzMS7I','eLf6ID4htstX9cjowYof6','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('IOte0B9zf59xQx4dfWfCj','N8q9N2O7e36NuFNsZrr6Q','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('9DHRM3qc6J2W1jALDljSr','GY5f2ud-7Kjyi03P9Ow9s','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('ZsFQBmeq_u2mFIvs_NItd','nb6G9EYUZl_6Oc4b4e2yJ','T3SJUd7xO-unLThU9aPx5');
INSERT INTO "rsvps" VALUES('8KJ2WHbh-DOV3vbN4pzd5','lgOe1linCu89H6OwE_pGu','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "rsvps" VALUES('biwF11uaeFvC0vWF_2fqe','GY5f2ud-7Kjyi03P9Ow9s','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "rsvps" VALUES('tvcUulanLEu9iHGkNLX3A','L48v8XqEAW88kwDHKtV6t','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "rsvps" VALUES('-vb1xNBkKZU2akLZGfBYj','o8RBJhhqnIprq0SPJ9zd3','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "rsvps" VALUES('FkRAfMZICblyTK9yj-pj2','ci8dbP__5lb-1v9XB37OH','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('BWqBB6FQdatVtB53Hs699','elIqLxVtXYjoAR0h4JwC8','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('Xw1ZZ5hhIY6tviHphcKi3','MldbEEkJp5vkgrv4yi_f7','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('-QM84aiS4miA5HtCRqwYT','yo2ZXKdSg-4um_FxCGd31','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('MUkNWbBiMOsceW769Tw6D','mURCFTQRoGVOcIbG7DgeL','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('pJH8Bsd6PnHKhdDdy-6AH','o8RBJhhqnIprq0SPJ9zd3','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('txaU3JOZQAZlxU954X1Jt','nb6G9EYUZl_6Oc4b4e2yJ','z1l8a7TPL4zOpBWrrc70v');
INSERT INTO "rsvps" VALUES('UJJJdZWNJPPKKOEenO1yq','ci8dbP__5lb-1v9XB37OH','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "rsvps" VALUES('ROYPECHg-U58XXkPv-OY8','elIqLxVtXYjoAR0h4JwC8','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "rsvps" VALUES('IRKKfL6kFSHYAEn_HWRCG','c5S2812xWzDKwJVAXdV1O','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "rsvps" VALUES('BwOuHsTusD2QO6oo8MiH9','9p2Sdkum1k8-euhYqw0Um','p_M18sKsYk7UORNvRFhR1');
INSERT INTO "rsvps" VALUES('GgaKeLvdp71Z2IR2aoh-z','ci8dbP__5lb-1v9XB37OH','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('jcIGjOuC3JeuXcNjS27M0','elIqLxVtXYjoAR0h4JwC8','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('O-2Wtpo4eFW-UF9lK-HiP','Z6OpYvFZ3ZwHV4BugTsTG','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('KfTFIsHxnBJb3LRkzkfUE','lgOe1linCu89H6OwE_pGu','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('5M28aLUmvhb6U0PHXRvd1','c5S2812xWzDKwJVAXdV1O','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('Iz566Pht1WqJhGo1aZ0Zu','L48v8XqEAW88kwDHKtV6t','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('-s4_h-7vBKDvbpu4nQ-R5','o8RBJhhqnIprq0SPJ9zd3','6Ytgf3DnS_Km7Pa5yoXDa');
INSERT INTO "rsvps" VALUES('PujRdiJkRpU2Dcjt_7AxQ','elIqLxVtXYjoAR0h4JwC8','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('rfz55YFhFq8NN-YF_4yUV','vBN4l6q78Ox-AZimbH8q1','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('wV5JWp0tvQWmCqOPvo6ok','yo2ZXKdSg-4um_FxCGd31','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('iN0hXS7LKnfMf8BLkx4JI','N8q9N2O7e36NuFNsZrr6Q','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('ddi08OqC87b-A3uAK1J2z','9p2Sdkum1k8-euhYqw0Um','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('AZQtH_SQ1Q5le9RDlGYRv','zU9Y4idODTfMl1uS7T71Z','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('w0u73spt0KZ3hLiA0XET5','nb6G9EYUZl_6Oc4b4e2yJ','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "rsvps" VALUES('yRN_PukocOTw5mMO35UvN','xQoXeTuPjMaLqtOWx41kB','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "rsvps" VALUES('9EM324UOZIeptcPBtbPmr','yo2ZXKdSg-4um_FxCGd31','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "rsvps" VALUES('fCEdQkwRxGt6mO7nWoibm','lgOe1linCu89H6OwE_pGu','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "rsvps" VALUES('s_9-7iM1qifodt5vdfSi4','c5S2812xWzDKwJVAXdV1O','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "rsvps" VALUES('7in6o_mR0yNcSSYCPLatS','L48v8XqEAW88kwDHKtV6t','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "rsvps" VALUES('BjiU3oR3gsS8XjeAFc5l-','ci8dbP__5lb-1v9XB37OH','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "rsvps" VALUES('UBCSlXDJGcDTGY9g6lj4f','vBN4l6q78Ox-AZimbH8q1','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "rsvps" VALUES('TgY9ebilhDVL28rfO7Rt2','N8q9N2O7e36NuFNsZrr6Q','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "rsvps" VALUES('3anztij2j2KkhIieXA3MC','L48v8XqEAW88kwDHKtV6t','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "rsvps" VALUES('hE0qNaDnlMLKN3hdM5zcy','nb6G9EYUZl_6Oc4b4e2yJ','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "rsvps" VALUES('jsQgdtRy14XQe0jKsPzkT','elIqLxVtXYjoAR0h4JwC8','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "rsvps" VALUES('-uNz7SKjDJhz7i8Twz9HI','MldbEEkJp5vkgrv4yi_f7','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "rsvps" VALUES('6XhjaaJFiONZoDYULWMxW','yo2ZXKdSg-4um_FxCGd31','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "rsvps" VALUES('76_7EXr8oqqy582kdJcIu','o8RBJhhqnIprq0SPJ9zd3','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "rsvps" VALUES('lpUhxWdoYo50F_oD-JbXp','zU9Y4idODTfMl1uS7T71Z','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "rsvps" VALUES('_dhCpHRxsycPYqNj5X1la','elIqLxVtXYjoAR0h4JwC8','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('yxDft4M8EkjCV_4dUiihZ','vBN4l6q78Ox-AZimbH8q1','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('6XzSSyq64L5tdDy5yV3Q1','Z6OpYvFZ3ZwHV4BugTsTG','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('HLvN2bnrsmVmyi47dobHT','GY5f2ud-7Kjyi03P9Ow9s','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('4VPhGo5XFGL8i4EhNfZg9','c5S2812xWzDKwJVAXdV1O','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('UiVG0tKJlwDqfXZbvLKgu','9p2Sdkum1k8-euhYqw0Um','fqiG3ELvXNV3ZXgLKURZ7');
INSERT INTO "rsvps" VALUES('J9P3lBndor7hDBzd4RaXe','ci8dbP__5lb-1v9XB37OH','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('zSiTgQzJQ62oJ-Sdjc4MC','xQoXeTuPjMaLqtOWx41kB','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('LZmFqeAnDnD__v6F7KtWz','yo2ZXKdSg-4um_FxCGd31','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('OtoTgh6m0NV00GeA-l7g4','o8RBJhhqnIprq0SPJ9zd3','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('FmAIu16hF1l3LewXOwjcN','zU9Y4idODTfMl1uS7T71Z','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('QKNOBKkB_OH7LcmrL7kpo','nb6G9EYUZl_6Oc4b4e2yJ','_KDPWE7W8XHyCGdW1Jqz0');
INSERT INTO "rsvps" VALUES('0G47gkjVsawKekfBr8RAW','xQoXeTuPjMaLqtOWx41kB','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('qIb2VNUdOkGDOjDD9yegL','MldbEEkJp5vkgrv4yi_f7','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('cgSYBrv4sj8NSCTGNH5t6','GY5f2ud-7Kjyi03P9Ow9s','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('D6_V3dMM8gsaEwXuoO8y4','c5S2812xWzDKwJVAXdV1O','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('hhd7snN3hXpGWIfAZmRHS','L48v8XqEAW88kwDHKtV6t','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('WDx-DLTK31KrIw2abMgJ9','9p2Sdkum1k8-euhYqw0Um','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "rsvps" VALUES('6nhQV8q-Pw9qKJj6SVYvI','ci8dbP__5lb-1v9XB37OH','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "rsvps" VALUES('HUbdTcUeShOobPvIZI-Bs','xQoXeTuPjMaLqtOWx41kB','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "rsvps" VALUES('IyXVfiKQIdBfDF1Sl60D4','yo2ZXKdSg-4um_FxCGd31','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "rsvps" VALUES('QOSGgqb6ayDw--G5rgmEk','N8q9N2O7e36NuFNsZrr6Q','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "rsvps" VALUES('Rx-IRC-QKwxmTz7vJrOzj','yo2ZXKdSg-4um_FxCGd31','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "rsvps" VALUES('BzAU0UsdSgyKNGS9ky0jP','GY5f2ud-7Kjyi03P9Ow9s','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "rsvps" VALUES('dPsRbcB1AYhqTnCsUm7zR','o8RBJhhqnIprq0SPJ9zd3','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "rsvps" VALUES('KsM1p64q2aQUkCkLTv2pp','nb6G9EYUZl_6Oc4b4e2yJ','tas_A2j6mnCwRp25e7zqv');
INSERT INTO "rsvps" VALUES('OoFOacCqzhEp9K-Qx5AWz','ci8dbP__5lb-1v9XB37OH','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('vKNBsffGquagnAvkYxb20','yo2ZXKdSg-4um_FxCGd31','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('qpuI4tfL5HuOq_aWCrPy2','N8q9N2O7e36NuFNsZrr6Q','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('QQR1ZwWjofivDrt2svqqt','mURCFTQRoGVOcIbG7DgeL','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('e5O-QgQI5VXSFpkwvyo3g','c5S2812xWzDKwJVAXdV1O','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('2fW5y36hpjydHpUOOqiX3','zU9Y4idODTfMl1uS7T71Z','653Laslo-7HV4UdR60VwR');
INSERT INTO "rsvps" VALUES('PIDwp2izmh-AabkxGY3hQ','ci8dbP__5lb-1v9XB37OH','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "rsvps" VALUES('Ww9o-4WScxm_qU0xNIzy-','xQoXeTuPjMaLqtOWx41kB','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "rsvps" VALUES('u3QEVTeCUQh7cKRsJOtF5','vBN4l6q78Ox-AZimbH8q1','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "rsvps" VALUES('_rwQ6kCyrCsLvPfdXIXJV','N8q9N2O7e36NuFNsZrr6Q','cO2_Nc0x7m8d-gkVyu-yp');
INSERT INTO "rsvps" VALUES('R5FClXjiXKHl6KUFPa-ez','MldbEEkJp5vkgrv4yi_f7','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "rsvps" VALUES('HZVkrdH7e0WZtgUFWiDLO','V4fmvS7jwWLo-IuX5YCbC','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "rsvps" VALUES('tdALOurfQt1hZvy4kHRRv','yo2ZXKdSg-4um_FxCGd31','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "rsvps" VALUES('YfrVDspjtS2uRKGKmR_dp','lgOe1linCu89H6OwE_pGu','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "rsvps" VALUES('kdmjx0ELt5ff88d3og4b_','nb6G9EYUZl_6Oc4b4e2yJ','hFSVi1NdhxC0ZStQE5ZZX');
INSERT INTO "rsvps" VALUES('uAc0CDtOueK67jr7adqhv','elIqLxVtXYjoAR0h4JwC8','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "rsvps" VALUES('W1y26EllIVB6by2_PCoC3','N8q9N2O7e36NuFNsZrr6Q','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "rsvps" VALUES('YijOZLKPHjc7XuzjTbfaI','c5S2812xWzDKwJVAXdV1O','b_LuQUObIIxcv_Mlg7gvo');
INSERT INTO "rsvps" VALUES('LnwiXRBCA4WueBi_JS6Xk','ci8dbP__5lb-1v9XB37OH','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "rsvps" VALUES('Mjfr3rCQC9HxuZ_PpvEO1','MldbEEkJp5vkgrv4yi_f7','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "rsvps" VALUES('MeAmWxndslfc9T1aSxVry','lgOe1linCu89H6OwE_pGu','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "rsvps" VALUES('f72lw2GkFmsdebbenF4rD','nb6G9EYUZl_6Oc4b4e2yJ','Ljq2361xA-6AtdyIXl1D0');
INSERT INTO "rsvps" VALUES('Yj4Fgd8VVEF_0kCahmmf7','ci8dbP__5lb-1v9XB37OH','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "rsvps" VALUES('5So3X5Fyb_hSo-WLRL8DO','elIqLxVtXYjoAR0h4JwC8','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "rsvps" VALUES('mfyo2Sfx2XDIvDzzkRWEz','Z6OpYvFZ3ZwHV4BugTsTG','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "rsvps" VALUES('6QU6VP7qLb3cRdkwJqDeB','elIqLxVtXYjoAR0h4JwC8','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('8jiIxP4m3RS1dnfJCZDq6','Z6OpYvFZ3ZwHV4BugTsTG','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('mCkSfFOJRLs9lxE9tBc69','eLf6ID4htstX9cjowYof6','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('a4m8hHzgc0h3T5a6s1w4A','lgOe1linCu89H6OwE_pGu','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('pSSj4_253aphdCKZQZnlC','mURCFTQRoGVOcIbG7DgeL','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('QGkRxkqvrHzSmCfNPcZEJ','nb6G9EYUZl_6Oc4b4e2yJ','hIsmJgBfZiWowD4PxpfKb');
INSERT INTO "rsvps" VALUES('Nf_fYSPM5Xk4ptWoOUAKh','ci8dbP__5lb-1v9XB37OH','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "rsvps" VALUES('p9ccA6vkgFOig66SUL2hT','Z6OpYvFZ3ZwHV4BugTsTG','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "rsvps" VALUES('nB4njnSpnGns7BgTvEige','lgOe1linCu89H6OwE_pGu','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "rsvps" VALUES('bJ9zAj1wHTcmdyGUHKmgs','mURCFTQRoGVOcIbG7DgeL','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "rsvps" VALUES('PRW7eltPy4Z-Wqu19W7Rx','c5S2812xWzDKwJVAXdV1O','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "rsvps" VALUES('hf4dReRxa_7eNM9pbjcoF','MldbEEkJp5vkgrv4yi_f7','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "rsvps" VALUES('J7HbRUW9TjlhDtLR6IOXm','yo2ZXKdSg-4um_FxCGd31','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "rsvps" VALUES('k_NUvINmvgFCfqKtD_kBO','N8q9N2O7e36NuFNsZrr6Q','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "rsvps" VALUES('rXzG-JGIcuZb5Nr4uT8A3','o8RBJhhqnIprq0SPJ9zd3','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "rsvps" VALUES('To0pxNxQNDG41B0LteelD','nb6G9EYUZl_6Oc4b4e2yJ','2LWBMof-CEnu7UbVFhthf');
INSERT INTO "rsvps" VALUES('U7KoDZiR512Y2rUeX7tbA','elIqLxVtXYjoAR0h4JwC8','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "rsvps" VALUES('2cc_ZPuP9zy7tLZ35-nF-','vBN4l6q78Ox-AZimbH8q1','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "rsvps" VALUES('7TY4EVB-qHOyxuY53yZgQ','Z6OpYvFZ3ZwHV4BugTsTG','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "rsvps" VALUES('Nv0Fk5n8WUd8IAe4kt-vp','yo2ZXKdSg-4um_FxCGd31','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "rsvps" VALUES('sAUjNmnvs-wb8uJnLFna4','nb6G9EYUZl_6Oc4b4e2yJ','v-v-ZCiBTuQ6DTuwf5Uvx');
INSERT INTO "rsvps" VALUES('CE-H_EmubsgYq3vO7eTT8','ci8dbP__5lb-1v9XB37OH','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "rsvps" VALUES('-TzOqxKz5tSq9y9zXwc9I','Z6OpYvFZ3ZwHV4BugTsTG','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "rsvps" VALUES('TxSwwodepNeF9Yko9ewY5','eLf6ID4htstX9cjowYof6','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "rsvps" VALUES('ZuKY6LomcXpPJ4o7Rn30h','o8RBJhhqnIprq0SPJ9zd3','zeC7AGyqkuMKpY5WxbckT');
INSERT INTO "rsvps" VALUES('4hotToajaKkQYlAre58f4','ci8dbP__5lb-1v9XB37OH','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('wIITalPuoS7ujt5lKvQj8','MldbEEkJp5vkgrv4yi_f7','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('m4Lg3KasqBM8AlVZT54B5','V4fmvS7jwWLo-IuX5YCbC','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('EWwyJ_618k56Brp7k_vte','eLf6ID4htstX9cjowYof6','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('8jK2z4CdXPTluor9YDfE9','GY5f2ud-7Kjyi03P9Ow9s','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('gddg1nFsT_FOaxZeCg76U','c5S2812xWzDKwJVAXdV1O','rJhXeJVBKd4Lll0FKaIWo');
INSERT INTO "rsvps" VALUES('aCvUhG6FE9OVhGzUeq5fv','o8RBJhhqnIprq0SPJ9zd3','rJhXeJVBKd4Lll0FKaIWo');
CREATE TABLE "session_hosts" (
	`session_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `guest_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_hosts" VALUES('3ZLdpsn4gv5MTBRXvfV0R','ShyRUs0k0zkJSJeStRiP7');
INSERT INTO "session_hosts" VALUES('nYpqOeRPOYoZgLb6k8hCT','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "session_hosts" VALUES('ci8dbP__5lb-1v9XB37OH','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "session_hosts" VALUES('elIqLxVtXYjoAR0h4JwC8','B861fQQuYzBhd-Mocc33H');
INSERT INTO "session_hosts" VALUES('xQoXeTuPjMaLqtOWx41kB','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "session_hosts" VALUES('MldbEEkJp5vkgrv4yi_f7','RH72K1YnCL9U6GaoBIZ3A');
INSERT INTO "session_hosts" VALUES('vBN4l6q78Ox-AZimbH8q1','GmxREzYZDWHhdE3YJBkly');
INSERT INTO "session_hosts" VALUES('Z6OpYvFZ3ZwHV4BugTsTG','2tq-6-EBPhS296h5jaN3w');
INSERT INTO "session_hosts" VALUES('V4fmvS7jwWLo-IuX5YCbC','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "session_hosts" VALUES('yo2ZXKdSg-4um_FxCGd31','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "session_hosts" VALUES('eLf6ID4htstX9cjowYof6','oYpHhelks-_fMgSi8Ynqv');
INSERT INTO "session_hosts" VALUES('N8q9N2O7e36NuFNsZrr6Q','XHeT_4Wow9aEWWJG576Kh');
INSERT INTO "session_hosts" VALUES('lgOe1linCu89H6OwE_pGu','u4sh60Jtyei1yRqfuvWhq');
INSERT INTO "session_hosts" VALUES('mURCFTQRoGVOcIbG7DgeL','jDbaErpGlXD2gxXe7IhtZ');
INSERT INTO "session_hosts" VALUES('mURCFTQRoGVOcIbG7DgeL','MvNRNQmDDalIVOqCGUwcA');
INSERT INTO "session_hosts" VALUES('GY5f2ud-7Kjyi03P9Ow9s','CO4-kIGmWGDbsH-ZNRVfp');
INSERT INTO "session_hosts" VALUES('c5S2812xWzDKwJVAXdV1O','9jPdUf_E56CxZut0Qn_cz');
INSERT INTO "session_hosts" VALUES('L48v8XqEAW88kwDHKtV6t','qiyX-HGyolJOsfDOFmuLQ');
INSERT INTO "session_hosts" VALUES('o8RBJhhqnIprq0SPJ9zd3','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "session_hosts" VALUES('9p2Sdkum1k8-euhYqw0Um','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "session_hosts" VALUES('zU9Y4idODTfMl1uS7T71Z','q4O1MRMpeQlO0TyrxQd_R');
INSERT INTO "session_hosts" VALUES('nb6G9EYUZl_6Oc4b4e2yJ','9jPdUf_E56CxZut0Qn_cz');
CREATE TABLE "session_locations" (
	`session_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`session_id`, `location_id`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_locations" VALUES('3ZLdpsn4gv5MTBRXvfV0R','loc-main-hall');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-main-hall');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-room-a');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-room-b');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-library');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-boardroom');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-auditorium');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-courtyard');
INSERT INTO "session_locations" VALUES('zUke6Fq8eKDGuiqCIOM-K','loc-rooftop');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-main-hall');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-room-a');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-room-b');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-library');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-boardroom');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-auditorium');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-courtyard');
INSERT INTO "session_locations" VALUES('Im8TghvUKvWEfX_zHptUC','loc-rooftop');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-main-hall');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-room-a');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-room-b');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-library');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-boardroom');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-auditorium');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-courtyard');
INSERT INTO "session_locations" VALUES('K7wA1G0LtUA7PNHS6qawb','loc-rooftop');
INSERT INTO "session_locations" VALUES('nYpqOeRPOYoZgLb6k8hCT','loc-main-hall');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-main-hall');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-room-a');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-room-b');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-library');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-boardroom');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-auditorium');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-courtyard');
INSERT INTO "session_locations" VALUES('5gh0RI7wMMAlu0VHWLdlG','loc-rooftop');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-main-hall');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-room-a');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-room-b');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-library');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-boardroom');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-auditorium');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-courtyard');
INSERT INTO "session_locations" VALUES('zygaoOBil2tE9dhyibo0W','loc-rooftop');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-main-hall');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-room-a');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-room-b');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-library');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-boardroom');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-auditorium');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-courtyard');
INSERT INTO "session_locations" VALUES('cjqklgIIf4O19zBqQwmy5','loc-rooftop');
INSERT INTO "session_locations" VALUES('ci8dbP__5lb-1v9XB37OH','loc-main-hall');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-main-hall');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-room-a');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-room-b');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-library');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-boardroom');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-auditorium');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-courtyard');
INSERT INTO "session_locations" VALUES('MwfTCqpgG_h52VwvJ8QME','loc-rooftop');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-main-hall');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-room-a');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-room-b');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-library');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-boardroom');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-auditorium');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-courtyard');
INSERT INTO "session_locations" VALUES('3oFdj6LiKnLUjCRYkCpym','loc-rooftop');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-main-hall');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-room-a');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-room-b');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-library');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-boardroom');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-auditorium');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-courtyard');
INSERT INTO "session_locations" VALUES('sHTA18ot2fJNgF__J2O0W','loc-rooftop');
INSERT INTO "session_locations" VALUES('elIqLxVtXYjoAR0h4JwC8','loc-main-hall');
INSERT INTO "session_locations" VALUES('xQoXeTuPjMaLqtOWx41kB','loc-room-a');
INSERT INTO "session_locations" VALUES('MldbEEkJp5vkgrv4yi_f7','loc-main-hall');
INSERT INTO "session_locations" VALUES('vBN4l6q78Ox-AZimbH8q1','loc-room-b');
INSERT INTO "session_locations" VALUES('Z6OpYvFZ3ZwHV4BugTsTG','loc-room-a');
INSERT INTO "session_locations" VALUES('V4fmvS7jwWLo-IuX5YCbC','loc-main-hall');
INSERT INTO "session_locations" VALUES('yo2ZXKdSg-4um_FxCGd31','loc-room-b');
INSERT INTO "session_locations" VALUES('eLf6ID4htstX9cjowYof6','loc-room-a');
INSERT INTO "session_locations" VALUES('N8q9N2O7e36NuFNsZrr6Q','loc-main-hall');
INSERT INTO "session_locations" VALUES('N8q9N2O7e36NuFNsZrr6Q','loc-auditorium');
INSERT INTO "session_locations" VALUES('lgOe1linCu89H6OwE_pGu','loc-room-b');
INSERT INTO "session_locations" VALUES('mURCFTQRoGVOcIbG7DgeL','loc-main-hall');
INSERT INTO "session_locations" VALUES('GY5f2ud-7Kjyi03P9Ow9s','loc-room-b');
INSERT INTO "session_locations" VALUES('c5S2812xWzDKwJVAXdV1O','loc-main-hall');
INSERT INTO "session_locations" VALUES('c5S2812xWzDKwJVAXdV1O','loc-auditorium');
INSERT INTO "session_locations" VALUES('L48v8XqEAW88kwDHKtV6t','loc-main-hall');
INSERT INTO "session_locations" VALUES('o8RBJhhqnIprq0SPJ9zd3','loc-room-a');
INSERT INTO "session_locations" VALUES('9p2Sdkum1k8-euhYqw0Um','loc-room-b');
INSERT INTO "session_locations" VALUES('zU9Y4idODTfMl1uS7T71Z','loc-main-hall');
INSERT INTO "session_locations" VALUES('nb6G9EYUZl_6Oc4b4e2yJ','loc-main-hall');
CREATE TABLE "session_proposals" (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer,
	`created_time` text NOT NULL, `updated_time` text, `cohost_wanted` integer DEFAULT false NOT NULL, `cohost_wanted_note` text, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "session_proposals" VALUES('1WxnaHjmzL-MrFXqoga12','tCNQtXjwgJKS47DHOu32C','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',30,'2026-11-22T18:53:09.850Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('h5zpYUwKcU6AbUhJpW6Il','tCNQtXjwgJKS47DHOu32C','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',NULL,'2026-11-22T18:53:09.850Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('jfVWtciMXay_FusYKq4iy','tCNQtXjwgJKS47DHOu32C','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',150,'2026-11-22T18:53:09.850Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('dqrBAvUJuyMrPACrjWWce','tCNQtXjwgJKS47DHOu32C','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',90,'2026-11-22T18:53:09.850Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('i_B-1i-hdFFMOe-xrJ70B','tCNQtXjwgJKS47DHOu32C','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-22T18:53:09.850Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('q9-xnEACfepKaax5ZL0-4','tCNQtXjwgJKS47DHOu32C','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-22T18:53:09.850Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('RR-UfrH1lmmw9JvQBpZE9','tCNQtXjwgJKS47DHOu32C','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-22T18:53:09.850Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('HOe8H19DZ187KFigxlLj7','tCNQtXjwgJKS47DHOu32C','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',120,'2026-11-22T18:53:09.850Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('M9c4OihAxgT5mH8WhT2e2','tCNQtXjwgJKS47DHOu32C','Hackathon Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Hackathon attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('qxnaSWeCZVJ_x7uhYXUM2','tCNQtXjwgJKS47DHOu32C','Networking & Coffee Chat: Connect with Hackathon Peers','An informal networking session designed to help Hackathon attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('5du-tM_03t9n7ntDybheh','tCNQtXjwgJKS47DHOu32C','Hackathon Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Hackathon community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('WvU5O9bV8-VLx2HHDaA0O','y74c07QXIkssDeblYsOSY','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-22T18:53:09.855Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('qgxfztgDGhigbvuxrRCks','y74c07QXIkssDeblYsOSY','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',150,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Hti-rXuCo__RH--HZhXqD','y74c07QXIkssDeblYsOSY','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('PT4iarIt-AKQ-5g5euAK3','y74c07QXIkssDeblYsOSY','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-22T18:53:09.855Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('7nCU-MBojH1a51wJTTfGU','y74c07QXIkssDeblYsOSY','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',150,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ik5U_5cRWPb2BQ-GFkfBn','y74c07QXIkssDeblYsOSY','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',30,'2026-11-22T18:53:09.855Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('RNYAEFU56dvgZKrKXC_vB','y74c07QXIkssDeblYsOSY','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('OZ-D_jct8LPqhsOt3kS3a','y74c07QXIkssDeblYsOSY','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('bE7HTUMnzDpQ3uQMNEkbw','y74c07QXIkssDeblYsOSY','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('kEYp14RvPM7cxxLssjJUM','y74c07QXIkssDeblYsOSY','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('IW5fG9mUZ-34OCmxDsZdN','y74c07QXIkssDeblYsOSY','Open Source Summit Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Open Source Summit attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('YaLNTbhKL6VaCi28VEg1n','y74c07QXIkssDeblYsOSY','Networking & Coffee Chat: Connect with Open Source Summit Peers','An informal networking session designed to help Open Source Summit attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('HiDJvL9tFRiNOXFWcPwr_','y74c07QXIkssDeblYsOSY','Open Source Summit Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Open Source Summit community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('TjgBSLfg16pMPiHRyE9Ex','PPGDvamTBn3-mmtGaFpIs','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.',60,'2026-11-22T18:53:09.855Z',NULL,1,'Someone who has run React in production at scale',1);
INSERT INTO "session_proposals" VALUES('No5bawBF0YyvML7baPlXm','PPGDvamTBn3-mmtGaFpIs','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('AGBEY_njyBy5Q7jRGUZYp','PPGDvamTBn3-mmtGaFpIs','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('1vmXq_aklEGRWiKfVvg_O','PPGDvamTBn3-mmtGaFpIs','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.',60,'2026-11-22T18:53:09.855Z',NULL,1,'A designer to cover the Figma side',1);
INSERT INTO "session_proposals" VALUES('DiwkZNYszoJ4Y8u2zULZX','PPGDvamTBn3-mmtGaFpIs','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ZKjvcX-vIAtHw2WhDDmxH','PPGDvamTBn3-mmtGaFpIs','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.',60,'2026-11-22T18:53:09.855Z',NULL,1,'Anyone with a migration back to a monolith to share',1);
INSERT INTO "session_proposals" VALUES('EXrWawC1luKRlZx5ikFrv','PPGDvamTBn3-mmtGaFpIs','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('Dbxx2Q_p7kPeOvtqJpxsY','PPGDvamTBn3-mmtGaFpIs','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('kIoZ2VvKhffSCGzA-UzVa','PPGDvamTBn3-mmtGaFpIs','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('COVa7UWYU5frFHrOdbm3D','PPGDvamTBn3-mmtGaFpIs','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('7_a3qxw4M5vOCynSHpF7M','PPGDvamTBn3-mmtGaFpIs','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('vz9gIngxrD20xdhub4aTA','PPGDvamTBn3-mmtGaFpIs','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('4CL_x9jUBerrTq2nZic1y','PPGDvamTBn3-mmtGaFpIs','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('ZuzR7zm-8hRB2t-BzRS26','PPGDvamTBn3-mmtGaFpIs','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('eVa4GhsKkugwUOCZ5zXF0','PPGDvamTBn3-mmtGaFpIs','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('LCEgZ0T55iEiW_TuM1zAX','PPGDvamTBn3-mmtGaFpIs','Web Unconference Lightning Talks: Community Showcase','A fast-paced session featuring **5-minute lightning talks** from Web Unconference attendees. This is your chance to share a quick tip, tool, or technique with the community.

We''ll have 8-10 speakers covering diverse topics chosen by community vote. Past lightning talks have covered everything from productivity hacks to cutting-edge research findings. Whether you''re a first-time speaker or seasoned presenter, lightning talks provide a low-pressure environment to share your expertise.

> Submit your lightning talk proposal during the event — we''ll be accepting submissions right up until the session begins!',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('kETG08fbq3ELygyL_r01I','PPGDvamTBn3-mmtGaFpIs','Networking & Coffee Chat: Connect with Web Unconference Peers','An informal networking session designed to help Web Unconference attendees connect over coffee and conversation. This isn''t a structured presentation - instead, we''ll facilitate small group discussions around shared interests and challenges.

Whether you''re looking for career advice, collaboration opportunities, or just want to meet like-minded professionals, this session provides a welcoming environment for meaningful connections.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('dqzoRjwwtXYo6Q_by8trQ','PPGDvamTBn3-mmtGaFpIs','Web Unconference Panel: Industry Leaders Share Their Insights','Join us for an engaging panel discussion featuring industry leaders and Web Unconference community members. Our panelists will share their perspectives on current trends, future predictions, and career advice.

This interactive session includes audience Q&A, so come prepared with your questions! Topics will be driven by audience interest but typically cover emerging technologies, leadership challenges, and navigating career transitions in tech.',30,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('3Fah_E9gWz_GfkuanoTRj','PPGDvamTBn3-mmtGaFpIs','Writing Documentation People Actually Read','Most documentation is written once, in a hurry, by whoever shipped the feature. This session is about the opposite: treating docs as a product with readers, a first minute that has to land, and a maintenance cost you plan for.

We''ll look at real examples — a few good, several painfully bad — and pull out what separates them: task-shaped titles, examples before explanations, and the courage to delete a page.

Bring a page you''re unhappy with and we''ll rework it together.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('BpCao3_JGp6jKtwibImZS','PPGDvamTBn3-mmtGaFpIs','Your First Conference Talk: From Idea to Stage','You have something worth saying and no idea how to turn it into 30 minutes on a stage. Let''s fix that.

We''ll cover finding a topic that''s genuinely yours, writing an abstract that survives a review committee, building slides that support you instead of competing with you, and what to do when your demo dies in front of 200 people (it will, eventually).

Aimed at people who have *never* spoken before. No slides of my own — we work on yours.',90,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('uRQ9-NLdODTV2O-9ZbqeM','PPGDvamTBn3-mmtGaFpIs','Ask Me Anything: Migrating a Legacy Monolith','**Looking for someone to host this!**

Several of us are staring down the same problem: a monolith that works, pays the bills, and is slowly becoming impossible to change. We''d love to hear from somebody who has actually come out the other side of a migration — what you''d do again, and what you''d never repeat.

If you''ve lived through one, please add yourself as host. An honest hour of war stories beats a polished talk.',60,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
INSERT INTO "session_proposals" VALUES('717l-rDjvWjoRF9dARR5b','PPGDvamTBn3-mmtGaFpIs','Board Games for People Who Are Tired of Talking','By day three, everyone''s social battery is empty. This is a quiet room with a table, a stack of games, and no agenda.

Nobody has volunteered to bring the games yet — if you''re travelling with something short and easy to teach, add yourself as host and we''ll make it happen.',120,'2026-11-22T18:53:09.855Z',NULL,0,NULL,1);
CREATE TABLE "votes" (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`choice` text NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "votes" VALUES('BCJqbirJi65Eh2YBz4oPt','WvU5O9bV8-VLx2HHDaA0O','ShyRUs0k0zkJSJeStRiP7','maybe');
INSERT INTO "votes" VALUES('4a248amc6hTk4qS2_KpJ9','PT4iarIt-AKQ-5g5euAK3','ShyRUs0k0zkJSJeStRiP7','interested');
INSERT INTO "votes" VALUES('qHrz1_Z9EPVTN5BnL7ZPf','ik5U_5cRWPb2BQ-GFkfBn','ShyRUs0k0zkJSJeStRiP7','maybe');
INSERT INTO "votes" VALUES('DUTDF7TVpsKjzxhE-Y2Zl','RNYAEFU56dvgZKrKXC_vB','ShyRUs0k0zkJSJeStRiP7','maybe');
INSERT INTO "votes" VALUES('PsPY4plcLkEPtB1s3CR9Y','bE7HTUMnzDpQ3uQMNEkbw','ShyRUs0k0zkJSJeStRiP7','interested');
INSERT INTO "votes" VALUES('MYW8IrSu4vYyY2pb26l6V','kEYp14RvPM7cxxLssjJUM','ShyRUs0k0zkJSJeStRiP7','skip');
INSERT INTO "votes" VALUES('NowEj4stxEtWxfN37r3Q_','qgxfztgDGhigbvuxrRCks','jDbaErpGlXD2gxXe7IhtZ','maybe');
INSERT INTO "votes" VALUES('zsqq5jGFH1WEff4d0yMA7','PT4iarIt-AKQ-5g5euAK3','jDbaErpGlXD2gxXe7IhtZ','interested');
INSERT INTO "votes" VALUES('mwFrAu1kt-SGTB0oT9q_u','7nCU-MBojH1a51wJTTfGU','jDbaErpGlXD2gxXe7IhtZ','skip');
INSERT INTO "votes" VALUES('WbOLdfSrCsy0ghvVP7KzO','bE7HTUMnzDpQ3uQMNEkbw','jDbaErpGlXD2gxXe7IhtZ','maybe');
INSERT INTO "votes" VALUES('bRaB5p8DFqJ6bdjhr8VMX','7nCU-MBojH1a51wJTTfGU','9jPdUf_E56CxZut0Qn_cz','maybe');
INSERT INTO "votes" VALUES('JbiC0SvxGHIRbl0vwd8rA','ik5U_5cRWPb2BQ-GFkfBn','9jPdUf_E56CxZut0Qn_cz','maybe');
INSERT INTO "votes" VALUES('mRt50IVMRMEeEZmTyagrX','Hti-rXuCo__RH--HZhXqD','B861fQQuYzBhd-Mocc33H','maybe');
INSERT INTO "votes" VALUES('wU2HHmE57rq9arBpUJzyi','PT4iarIt-AKQ-5g5euAK3','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('7UUp2WNMEw_PsPCwNa_Kv','RNYAEFU56dvgZKrKXC_vB','B861fQQuYzBhd-Mocc33H','maybe');
INSERT INTO "votes" VALUES('zWn-oZyKETHY_4csESVH9','OZ-D_jct8LPqhsOt3kS3a','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('8XNuavXEHrQI6J2tNN-C3','bE7HTUMnzDpQ3uQMNEkbw','B861fQQuYzBhd-Mocc33H','skip');
INSERT INTO "votes" VALUES('doUqEOCSiovbt4xdQhyHx','qgxfztgDGhigbvuxrRCks','NeVPC4sOIpHAFioNYmgzv','skip');
INSERT INTO "votes" VALUES('gmDTjobu45Jn173WlpMsp','ik5U_5cRWPb2BQ-GFkfBn','NeVPC4sOIpHAFioNYmgzv','interested');
INSERT INTO "votes" VALUES('HVaP1Cnk4Udsuoh1wH-CF','WvU5O9bV8-VLx2HHDaA0O','ZDk7oXJvG4aIJGinraw1-','maybe');
INSERT INTO "votes" VALUES('Ivj81NVafsyK-P2pipzww','RNYAEFU56dvgZKrKXC_vB','ZDk7oXJvG4aIJGinraw1-','maybe');
INSERT INTO "votes" VALUES('LUNUpPGDPiIx-J-ND9gPa','bE7HTUMnzDpQ3uQMNEkbw','ZDk7oXJvG4aIJGinraw1-','skip');
INSERT INTO "votes" VALUES('e2qi4LVBlsFEmBoS0QMpd','WvU5O9bV8-VLx2HHDaA0O','EHsKrkDZ1krZzBzmwozA4','skip');
INSERT INTO "votes" VALUES('rYzKRYy0TlMYD3DduiGhe','qgxfztgDGhigbvuxrRCks','EHsKrkDZ1krZzBzmwozA4','skip');
INSERT INTO "votes" VALUES('a10fXVWG9wiFnMmttnIYi','Hti-rXuCo__RH--HZhXqD','EHsKrkDZ1krZzBzmwozA4','skip');
INSERT INTO "votes" VALUES('FFAqUSVEcxQ72EmphLdeO','PT4iarIt-AKQ-5g5euAK3','EHsKrkDZ1krZzBzmwozA4','maybe');
INSERT INTO "votes" VALUES('ihW0qeZlCK0OVQpnudKx4','RNYAEFU56dvgZKrKXC_vB','EHsKrkDZ1krZzBzmwozA4','maybe');
INSERT INTO "votes" VALUES('Qav7-zgL-52BiTF9Y1ty7','OZ-D_jct8LPqhsOt3kS3a','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('ppJxK3Hf2rVbVMDG6nE1h','bE7HTUMnzDpQ3uQMNEkbw','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('jgNX43MVeB9SFD2ChNeWF','kEYp14RvPM7cxxLssjJUM','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('4KyPI4a2MNHlI87K8pFrC','WvU5O9bV8-VLx2HHDaA0O','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('MeH89XIa-5fVZlhzJuaHQ','qgxfztgDGhigbvuxrRCks','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('GETp16mMrZu1Y1E41onmR','OZ-D_jct8LPqhsOt3kS3a','XHeT_4Wow9aEWWJG576Kh','maybe');
INSERT INTO "votes" VALUES('rtLadRcplC9qXtAyefVkI','kEYp14RvPM7cxxLssjJUM','XHeT_4Wow9aEWWJG576Kh','skip');
INSERT INTO "votes" VALUES('qkouBwiQMeXXfZEODoHBy','Hti-rXuCo__RH--HZhXqD','ID7ZhNxS1jNfhPMDxVxJL','skip');
INSERT INTO "votes" VALUES('-gb0r24uVDi9ogh_fsiZx','ik5U_5cRWPb2BQ-GFkfBn','ID7ZhNxS1jNfhPMDxVxJL','maybe');
INSERT INTO "votes" VALUES('OlbECKP8RxQoFA6Iek-14','kEYp14RvPM7cxxLssjJUM','ID7ZhNxS1jNfhPMDxVxJL','maybe');
INSERT INTO "votes" VALUES('9aErjJVPrvM_fuAM5Tfwd','qgxfztgDGhigbvuxrRCks','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('jbj0x2Y7cpmtjfRTLq4ot','Hti-rXuCo__RH--HZhXqD','q4O1MRMpeQlO0TyrxQd_R','interested');
INSERT INTO "votes" VALUES('3V6jdhUs73DhLeoHWuguH','PT4iarIt-AKQ-5g5euAK3','q4O1MRMpeQlO0TyrxQd_R','interested');
INSERT INTO "votes" VALUES('07mznUNisVyR5nR-Jwoei','7nCU-MBojH1a51wJTTfGU','q4O1MRMpeQlO0TyrxQd_R','skip');
INSERT INTO "votes" VALUES('n3Eo8-j1-opZQhFseoU6t','kEYp14RvPM7cxxLssjJUM','q4O1MRMpeQlO0TyrxQd_R','skip');
INSERT INTO "votes" VALUES('8fJXMTAUATQwA1Gxmu8cJ','OZ-D_jct8LPqhsOt3kS3a','6tQX6-ck20zvyo1Q78kcr','maybe');
INSERT INTO "votes" VALUES('pFVtSGUY62JQz46I7RlhZ','bE7HTUMnzDpQ3uQMNEkbw','6tQX6-ck20zvyo1Q78kcr','maybe');
INSERT INTO "votes" VALUES('3rVGpSAB3X2JrtXsq1oaB','kEYp14RvPM7cxxLssjJUM','6tQX6-ck20zvyo1Q78kcr','interested');
INSERT INTO "votes" VALUES('fwFeyzrzRefLZyjwcq6ci','WvU5O9bV8-VLx2HHDaA0O','pM17gpIj2Josz5tiFZ1el','skip');
INSERT INTO "votes" VALUES('oiDPVdL_41Do1pgoxa8ZA','qgxfztgDGhigbvuxrRCks','pM17gpIj2Josz5tiFZ1el','skip');
INSERT INTO "votes" VALUES('jln-I8T4s6NB1-IAHO6Zl','PT4iarIt-AKQ-5g5euAK3','pM17gpIj2Josz5tiFZ1el','skip');
INSERT INTO "votes" VALUES('-ngiydQcl2ZHXw1YEEBHv','7nCU-MBojH1a51wJTTfGU','pM17gpIj2Josz5tiFZ1el','interested');
INSERT INTO "votes" VALUES('VODlOHmWQOjpb0TONnd_p','ik5U_5cRWPb2BQ-GFkfBn','pM17gpIj2Josz5tiFZ1el','maybe');
INSERT INTO "votes" VALUES('juOX8ECkMowEbLH5bMMHY','RNYAEFU56dvgZKrKXC_vB','pM17gpIj2Josz5tiFZ1el','interested');
INSERT INTO "votes" VALUES('2TxgyAK1twiayiKUyQ0ZU','Hti-rXuCo__RH--HZhXqD','XC1WD3CPb71Kuu-q4FQEk','maybe');
INSERT INTO "votes" VALUES('ia8Z5ZUapARv2GpIk3eOV','PT4iarIt-AKQ-5g5euAK3','XC1WD3CPb71Kuu-q4FQEk','skip');
INSERT INTO "votes" VALUES('JDIOxdJQcCbSF18Ll6uFm','7nCU-MBojH1a51wJTTfGU','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('w4c47wVWAALn304lRQA-8','ik5U_5cRWPb2BQ-GFkfBn','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('dLEEpzlO7jqng1CLbR65r','bE7HTUMnzDpQ3uQMNEkbw','ZgqjVdi01mWWPTcE6HcFp','interested');
INSERT INTO "votes" VALUES('45vkJp9AtBqai-Mfqp9Cf','qgxfztgDGhigbvuxrRCks','T3SJUd7xO-unLThU9aPx5','maybe');
INSERT INTO "votes" VALUES('YOkgbvkAA-dJpuu70F6n5','PT4iarIt-AKQ-5g5euAK3','T3SJUd7xO-unLThU9aPx5','interested');
INSERT INTO "votes" VALUES('u7h6K50yaiKOWPKaenq4B','ik5U_5cRWPb2BQ-GFkfBn','T3SJUd7xO-unLThU9aPx5','maybe');
INSERT INTO "votes" VALUES('hBzUCPcGnECF47XUcTJMt','RNYAEFU56dvgZKrKXC_vB','T3SJUd7xO-unLThU9aPx5','interested');
INSERT INTO "votes" VALUES('PWSdVTGUJQ4o7ZOyrdtTY','bE7HTUMnzDpQ3uQMNEkbw','T3SJUd7xO-unLThU9aPx5','maybe');
INSERT INTO "votes" VALUES('952LVMCzLhLhr5pD5W_XQ','kEYp14RvPM7cxxLssjJUM','T3SJUd7xO-unLThU9aPx5','interested');
INSERT INTO "votes" VALUES('P96oc3KS2VpwmQCdYkhLE','Hti-rXuCo__RH--HZhXqD','oYpHhelks-_fMgSi8Ynqv','skip');
INSERT INTO "votes" VALUES('oEWeJKVB9oILpxoI3z1gg','PT4iarIt-AKQ-5g5euAK3','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('uor8J80o1hK3bHWoh6igr','ik5U_5cRWPb2BQ-GFkfBn','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('h4dbUThei9cMeLNJS6oCX','RNYAEFU56dvgZKrKXC_vB','oYpHhelks-_fMgSi8Ynqv','maybe');
INSERT INTO "votes" VALUES('ZOHzEJSmFJSmu17J7wYul','OZ-D_jct8LPqhsOt3kS3a','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('jS8DM-3WH-oYISKV0DNfY','bE7HTUMnzDpQ3uQMNEkbw','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('KMICc0rk9JFy_jEwALGfz','qgxfztgDGhigbvuxrRCks','z1l8a7TPL4zOpBWrrc70v','skip');
INSERT INTO "votes" VALUES('IiwVGPQx1N37ApYj4C4cA','Hti-rXuCo__RH--HZhXqD','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('AbXKAUE9P1knMkqjTV_AR','PT4iarIt-AKQ-5g5euAK3','z1l8a7TPL4zOpBWrrc70v','skip');
INSERT INTO "votes" VALUES('Gqy9QMe0lEnoGmUTgIWo1','RNYAEFU56dvgZKrKXC_vB','z1l8a7TPL4zOpBWrrc70v','maybe');
INSERT INTO "votes" VALUES('zHBrzAZXG3rDmKspDgELt','bE7HTUMnzDpQ3uQMNEkbw','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('_PDyhUdEaa4kUo946vhVE','kEYp14RvPM7cxxLssjJUM','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('vIigctKwnX_X1JhwqgoVb','WvU5O9bV8-VLx2HHDaA0O','p_M18sKsYk7UORNvRFhR1','interested');
INSERT INTO "votes" VALUES('uYWtrfdzMY_6NYF7xjHPs','qgxfztgDGhigbvuxrRCks','p_M18sKsYk7UORNvRFhR1','interested');
INSERT INTO "votes" VALUES('t6OdWBw_SIYWN5zPJYam0','OZ-D_jct8LPqhsOt3kS3a','p_M18sKsYk7UORNvRFhR1','maybe');
INSERT INTO "votes" VALUES('dSIcf7svn-dwPvUsJU04C','bE7HTUMnzDpQ3uQMNEkbw','p_M18sKsYk7UORNvRFhR1','maybe');
INSERT INTO "votes" VALUES('WZclX1bPmFnCHaGxuko2P','WvU5O9bV8-VLx2HHDaA0O','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('fEuOiVEe5XzIKoWyOBz5C','qgxfztgDGhigbvuxrRCks','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('vg0zejXYgkQ-qZayMrw7_','Hti-rXuCo__RH--HZhXqD','6Ytgf3DnS_Km7Pa5yoXDa','skip');
INSERT INTO "votes" VALUES('OCxSju8VRQ5KBw9AAdAJm','ik5U_5cRWPb2BQ-GFkfBn','6Ytgf3DnS_Km7Pa5yoXDa','maybe');
INSERT INTO "votes" VALUES('d3BifV1zef8bxb_ZWC--I','bE7HTUMnzDpQ3uQMNEkbw','6Ytgf3DnS_Km7Pa5yoXDa','skip');
INSERT INTO "votes" VALUES('Qgk28-lM9jcXiOQTITFbH','kEYp14RvPM7cxxLssjJUM','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('NTncaCrURPBESjmaQZdgO','WvU5O9bV8-VLx2HHDaA0O','qiyX-HGyolJOsfDOFmuLQ','maybe');
INSERT INTO "votes" VALUES('MSsxIAP8lSW2iN6Y0RFtA','ik5U_5cRWPb2BQ-GFkfBn','qiyX-HGyolJOsfDOFmuLQ','maybe');
INSERT INTO "votes" VALUES('CLaC1Iipzvt3Z1TKQ5EY-','RNYAEFU56dvgZKrKXC_vB','qiyX-HGyolJOsfDOFmuLQ','interested');
INSERT INTO "votes" VALUES('0K2_xXE6CuzSxMRRvIO5q','OZ-D_jct8LPqhsOt3kS3a','qiyX-HGyolJOsfDOFmuLQ','interested');
INSERT INTO "votes" VALUES('aZUrtX1o-OrhgJ2RtYmod','kEYp14RvPM7cxxLssjJUM','qiyX-HGyolJOsfDOFmuLQ','interested');
INSERT INTO "votes" VALUES('NF_caH1Uw27g_01rJ8yzu','PT4iarIt-AKQ-5g5euAK3','RH72K1YnCL9U6GaoBIZ3A','skip');
INSERT INTO "votes" VALUES('Se41pyJJZwk-d_isO-rIu','7nCU-MBojH1a51wJTTfGU','RH72K1YnCL9U6GaoBIZ3A','interested');
INSERT INTO "votes" VALUES('Q2osxbsaiE4dG5U6RbWK7','RNYAEFU56dvgZKrKXC_vB','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('cy8D674wyHPwN0tXQZMa4','OZ-D_jct8LPqhsOt3kS3a','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('hD7WtUcs4Le1DRw0MlwWg','WvU5O9bV8-VLx2HHDaA0O','CO4-kIGmWGDbsH-ZNRVfp','maybe');
INSERT INTO "votes" VALUES('GFazd7o3_frpG4B11HP5m','RNYAEFU56dvgZKrKXC_vB','CO4-kIGmWGDbsH-ZNRVfp','interested');
INSERT INTO "votes" VALUES('HJuFMqPOkGNHIeE34TaS1','bE7HTUMnzDpQ3uQMNEkbw','CO4-kIGmWGDbsH-ZNRVfp','interested');
INSERT INTO "votes" VALUES('li5JXxRquKXD7vZ7nlknD','kEYp14RvPM7cxxLssjJUM','CO4-kIGmWGDbsH-ZNRVfp','skip');
INSERT INTO "votes" VALUES('4cqE4bvp27WGGI7E5BcUF','WvU5O9bV8-VLx2HHDaA0O','u4sh60Jtyei1yRqfuvWhq','interested');
INSERT INTO "votes" VALUES('xMo51r1DmvnEISX1P8tST','Hti-rXuCo__RH--HZhXqD','u4sh60Jtyei1yRqfuvWhq','maybe');
INSERT INTO "votes" VALUES('RcDy_LZW3--kou0jDs-xN','ik5U_5cRWPb2BQ-GFkfBn','u4sh60Jtyei1yRqfuvWhq','interested');
INSERT INTO "votes" VALUES('Ptl7cy5kt3AzwrQCQbVIa','kEYp14RvPM7cxxLssjJUM','u4sh60Jtyei1yRqfuvWhq','skip');
INSERT INTO "votes" VALUES('YQNxz60yqSsPF3Pna_qSC','ik5U_5cRWPb2BQ-GFkfBn','fqiG3ELvXNV3ZXgLKURZ7','skip');
INSERT INTO "votes" VALUES('q81NKOZKtRv8jyeZuFnYE','bE7HTUMnzDpQ3uQMNEkbw','fqiG3ELvXNV3ZXgLKURZ7','interested');
INSERT INTO "votes" VALUES('e31acd4PIL1zEZxY3NPli','kEYp14RvPM7cxxLssjJUM','fqiG3ELvXNV3ZXgLKURZ7','maybe');
INSERT INTO "votes" VALUES('Sp7Nt30PoNogp9kUeoWwD','WvU5O9bV8-VLx2HHDaA0O','_KDPWE7W8XHyCGdW1Jqz0','maybe');
INSERT INTO "votes" VALUES('uyhmSyoWXkvKuU9MrOskD','qgxfztgDGhigbvuxrRCks','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('zUivowmv9vFTIgci859R4','ik5U_5cRWPb2BQ-GFkfBn','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('wYmRpmwwpf1Xko8j266Ks','RNYAEFU56dvgZKrKXC_vB','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('D9qXAiUgenhGvdkx1T41q','OZ-D_jct8LPqhsOt3kS3a','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('QUmQq6gokcn3h3n2O9RsC','bE7HTUMnzDpQ3uQMNEkbw','_KDPWE7W8XHyCGdW1Jqz0','maybe');
INSERT INTO "votes" VALUES('Cy29U4L3E3GCKjHSIAMWt','WvU5O9bV8-VLx2HHDaA0O','2tq-6-EBPhS296h5jaN3w','maybe');
INSERT INTO "votes" VALUES('TnRO8ppR5a4MYF1bXq2Ju','Hti-rXuCo__RH--HZhXqD','2tq-6-EBPhS296h5jaN3w','skip');
INSERT INTO "votes" VALUES('Ry0dSlIW5vKeiZrkC2YXj','kEYp14RvPM7cxxLssjJUM','2tq-6-EBPhS296h5jaN3w','maybe');
INSERT INTO "votes" VALUES('gKU8HIvFTEMRkgC9caVv8','qgxfztgDGhigbvuxrRCks','4NihDOqv7M8nE5B5bF85j','maybe');
INSERT INTO "votes" VALUES('szL7sIHabHpXGKblJEx2J','ik5U_5cRWPb2BQ-GFkfBn','4NihDOqv7M8nE5B5bF85j','interested');
INSERT INTO "votes" VALUES('ToEzgORhEioyX70Qkh2cu','OZ-D_jct8LPqhsOt3kS3a','4NihDOqv7M8nE5B5bF85j','skip');
INSERT INTO "votes" VALUES('E47Hq7UfSX6OWlirn-Ys5','WvU5O9bV8-VLx2HHDaA0O','tas_A2j6mnCwRp25e7zqv','interested');
INSERT INTO "votes" VALUES('vTbFJzOtoU35lzftItn8V','PT4iarIt-AKQ-5g5euAK3','tas_A2j6mnCwRp25e7zqv','skip');
INSERT INTO "votes" VALUES('E4knQ_Sh8yJhdN99TxKaL','RNYAEFU56dvgZKrKXC_vB','tas_A2j6mnCwRp25e7zqv','interested');
INSERT INTO "votes" VALUES('W7a7bc1777d5X1ysifuP-','WvU5O9bV8-VLx2HHDaA0O','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('OpiLephspUXXTk1EvY4aU','Hti-rXuCo__RH--HZhXqD','653Laslo-7HV4UdR60VwR','interested');
INSERT INTO "votes" VALUES('FIcF9sxXo8r_Z_dHkRFsx','OZ-D_jct8LPqhsOt3kS3a','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('cFDYsJVaCZdn_9jM1siEB','bE7HTUMnzDpQ3uQMNEkbw','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('StXGwda5fX9L5WSLsKWd1','kEYp14RvPM7cxxLssjJUM','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('n5-2aV42YNDkB2fpzb7Ya','WvU5O9bV8-VLx2HHDaA0O','cO2_Nc0x7m8d-gkVyu-yp','maybe');
INSERT INTO "votes" VALUES('Sf1bH3iqHLwDYgBCgxdkU','Hti-rXuCo__RH--HZhXqD','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('rIzNpz7MS-nktGPgb0KpF','RNYAEFU56dvgZKrKXC_vB','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('UTDyFc4_yPErQlUuh2Mfa','WvU5O9bV8-VLx2HHDaA0O','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('FCnnzdWhhkMLmD7An_XGb','Hti-rXuCo__RH--HZhXqD','hFSVi1NdhxC0ZStQE5ZZX','maybe');
INSERT INTO "votes" VALUES('wnJ-DaRdvp2eC7f_zzKZZ','PT4iarIt-AKQ-5g5euAK3','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('9vu_WZxjCkr5fASGBkH1X','ik5U_5cRWPb2BQ-GFkfBn','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('SvCnC5xDq8m63m2XMnQ1V','WvU5O9bV8-VLx2HHDaA0O','b_LuQUObIIxcv_Mlg7gvo','interested');
INSERT INTO "votes" VALUES('SXna-NK-5r-WaC1UxS-1q','RNYAEFU56dvgZKrKXC_vB','b_LuQUObIIxcv_Mlg7gvo','maybe');
INSERT INTO "votes" VALUES('y5ggHquoSFLSoFpuF_s6I','kEYp14RvPM7cxxLssjJUM','b_LuQUObIIxcv_Mlg7gvo','maybe');
INSERT INTO "votes" VALUES('0n6VFkIz87g4SCjNdB1C-','WvU5O9bV8-VLx2HHDaA0O','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('gfo380Plsl_0KSBGpQC65','qgxfztgDGhigbvuxrRCks','Ljq2361xA-6AtdyIXl1D0','skip');
INSERT INTO "votes" VALUES('gi9ZxqrVrgLhZgdDeLrbN','7nCU-MBojH1a51wJTTfGU','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('xqEfj8o6XdYMjfH5LOzhI','ik5U_5cRWPb2BQ-GFkfBn','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('HM95vf4dBYb3PIblMwQqR','OZ-D_jct8LPqhsOt3kS3a','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('vdCUFEad0c5aJsSWIcEMv','bE7HTUMnzDpQ3uQMNEkbw','Ljq2361xA-6AtdyIXl1D0','maybe');
INSERT INTO "votes" VALUES('rQ3hfxyLyHkeIHSDFgQNI','7nCU-MBojH1a51wJTTfGU','MvNRNQmDDalIVOqCGUwcA','interested');
INSERT INTO "votes" VALUES('nvA60C7EfkVD_moqslCtS','WvU5O9bV8-VLx2HHDaA0O','hIsmJgBfZiWowD4PxpfKb','skip');
INSERT INTO "votes" VALUES('P7HG5YXiZRmdxbke2eBYH','qgxfztgDGhigbvuxrRCks','hIsmJgBfZiWowD4PxpfKb','interested');
INSERT INTO "votes" VALUES('nR2uwQ7-DIFwIbCaXaboa','OZ-D_jct8LPqhsOt3kS3a','hIsmJgBfZiWowD4PxpfKb','skip');
INSERT INTO "votes" VALUES('uBmIsuU1SgnBnD3Qk91k-','bE7HTUMnzDpQ3uQMNEkbw','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('LQXqLvkk1nrtsXhmO22qk','ik5U_5cRWPb2BQ-GFkfBn','GmxREzYZDWHhdE3YJBkly','interested');
INSERT INTO "votes" VALUES('dGwOYes8tvu4kQ3WeAwvQ','OZ-D_jct8LPqhsOt3kS3a','GmxREzYZDWHhdE3YJBkly','interested');
INSERT INTO "votes" VALUES('KbIQI7b60SkYTXYGd2754','WvU5O9bV8-VLx2HHDaA0O','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('IM0h08xeekaxidXl3WtbY','PT4iarIt-AKQ-5g5euAK3','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('mUqBI667yFF6cpGyoZCRB','7nCU-MBojH1a51wJTTfGU','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('FQ_V3DD13mPSYthPWHPeC','ik5U_5cRWPb2BQ-GFkfBn','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('NkIT5ZSe3oih9_DugInJX','OZ-D_jct8LPqhsOt3kS3a','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('U8lH2V-YOeMnchNLBqy5v','bE7HTUMnzDpQ3uQMNEkbw','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('2fvCy7B_7dsI1U3J4cD9Q','PT4iarIt-AKQ-5g5euAK3','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('cGnN9lnBV93xapzCv2CVd','RNYAEFU56dvgZKrKXC_vB','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('VQg_qnomAVTkKAtMJJODL','Hti-rXuCo__RH--HZhXqD','zeC7AGyqkuMKpY5WxbckT','maybe');
INSERT INTO "votes" VALUES('GevixNAccFH0SeApSDEeq','PT4iarIt-AKQ-5g5euAK3','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('fXsmfHz3Ijif-M4gJofkx','7nCU-MBojH1a51wJTTfGU','zeC7AGyqkuMKpY5WxbckT','maybe');
INSERT INTO "votes" VALUES('QXj17JgOqev8b3Al7s18o','kEYp14RvPM7cxxLssjJUM','zeC7AGyqkuMKpY5WxbckT','skip');
INSERT INTO "votes" VALUES('RRZo-fH7UYYZlRPPDSH4t','WvU5O9bV8-VLx2HHDaA0O','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('0CId9ic0FenzO6-5IoSKj','qgxfztgDGhigbvuxrRCks','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('hUAs1tdpi8cC5lsXecHu5','Hti-rXuCo__RH--HZhXqD','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('qnTa5t8dgQ4hClAHVFXMi','7nCU-MBojH1a51wJTTfGU','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('kWsPM8tpiKNM42TBu7oIj','ik5U_5cRWPb2BQ-GFkfBn','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('bg4l9ByFLZFAOw87eyt70','OZ-D_jct8LPqhsOt3kS3a','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('Xq3MztWk-a9cL7kQn9mWP','kEYp14RvPM7cxxLssjJUM','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('Srs0aDZi7PMpczKOwp8pF','No5bawBF0YyvML7baPlXm','ShyRUs0k0zkJSJeStRiP7','maybe');
INSERT INTO "votes" VALUES('D_JTQNlerczzph4YfJWue','AGBEY_njyBy5Q7jRGUZYp','ShyRUs0k0zkJSJeStRiP7','skip');
INSERT INTO "votes" VALUES('TrL1b4uq0YVwVgAhCO0Ln','ZKjvcX-vIAtHw2WhDDmxH','ShyRUs0k0zkJSJeStRiP7','skip');
INSERT INTO "votes" VALUES('goG9fxNuAZgVtG61Ihsup','kIoZ2VvKhffSCGzA-UzVa','ShyRUs0k0zkJSJeStRiP7','maybe');
INSERT INTO "votes" VALUES('90ZjSNbrNTW2GOJWJ408H','7_a3qxw4M5vOCynSHpF7M','ShyRUs0k0zkJSJeStRiP7','skip');
INSERT INTO "votes" VALUES('nPgfko689nTYn_ZBXbu9A','ZuzR7zm-8hRB2t-BzRS26','ShyRUs0k0zkJSJeStRiP7','interested');
INSERT INTO "votes" VALUES('nsWQ8jbw2LYNHlMCfMMlq','3Fah_E9gWz_GfkuanoTRj','ShyRUs0k0zkJSJeStRiP7','interested');
INSERT INTO "votes" VALUES('U5hbTVDXvc8WLRE4EqgnM','717l-rDjvWjoRF9dARR5b','ShyRUs0k0zkJSJeStRiP7','skip');
INSERT INTO "votes" VALUES('AbOX8b3B8JW2BCn9Swiki','No5bawBF0YyvML7baPlXm','jDbaErpGlXD2gxXe7IhtZ','skip');
INSERT INTO "votes" VALUES('W9DcuUe523yLkqDO_E7U_','DiwkZNYszoJ4Y8u2zULZX','jDbaErpGlXD2gxXe7IhtZ','skip');
INSERT INTO "votes" VALUES('eu60Y8kja6pJH6QCq4B8o','ZKjvcX-vIAtHw2WhDDmxH','jDbaErpGlXD2gxXe7IhtZ','skip');
INSERT INTO "votes" VALUES('pKmC08vVM6_ibJM02igNo','kIoZ2VvKhffSCGzA-UzVa','jDbaErpGlXD2gxXe7IhtZ','interested');
INSERT INTO "votes" VALUES('1qF_Cjtw7n12u9FYY46YF','ZuzR7zm-8hRB2t-BzRS26','jDbaErpGlXD2gxXe7IhtZ','skip');
INSERT INTO "votes" VALUES('NmaV37CpNK72_eL_rRac9','BpCao3_JGp6jKtwibImZS','jDbaErpGlXD2gxXe7IhtZ','maybe');
INSERT INTO "votes" VALUES('Pq0VCGtwBptLo54TVVaTu','1vmXq_aklEGRWiKfVvg_O','9jPdUf_E56CxZut0Qn_cz','maybe');
INSERT INTO "votes" VALUES('2dCAovlglLhJCo9B-aR0-','ZKjvcX-vIAtHw2WhDDmxH','9jPdUf_E56CxZut0Qn_cz','interested');
INSERT INTO "votes" VALUES('qEKJGvWGflP3htrbzqvxg','Dbxx2Q_p7kPeOvtqJpxsY','9jPdUf_E56CxZut0Qn_cz','interested');
INSERT INTO "votes" VALUES('bWOYh7NeoQMBra7pF2EwF','COVa7UWYU5frFHrOdbm3D','9jPdUf_E56CxZut0Qn_cz','skip');
INSERT INTO "votes" VALUES('8SZXusxzBYjn2rKgnLFCH','vz9gIngxrD20xdhub4aTA','9jPdUf_E56CxZut0Qn_cz','maybe');
INSERT INTO "votes" VALUES('rqSoZLYigFmtY3dTVnnzW','4CL_x9jUBerrTq2nZic1y','9jPdUf_E56CxZut0Qn_cz','skip');
INSERT INTO "votes" VALUES('zspk9qadP0qr6C05b8rbE','3Fah_E9gWz_GfkuanoTRj','9jPdUf_E56CxZut0Qn_cz','skip');
INSERT INTO "votes" VALUES('EoEbsRFheoQDVVUyBI758','717l-rDjvWjoRF9dARR5b','9jPdUf_E56CxZut0Qn_cz','skip');
INSERT INTO "votes" VALUES('x7cvUn2hAWiKTw3uuyen-','TjgBSLfg16pMPiHRyE9Ex','B861fQQuYzBhd-Mocc33H','skip');
INSERT INTO "votes" VALUES('d0Cm97K13O_oubSjmTit5','AGBEY_njyBy5Q7jRGUZYp','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('SR6rM2cglgowin1YmLHUp','DiwkZNYszoJ4Y8u2zULZX','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('amG5EwVKnB1qivDXtPska','ZKjvcX-vIAtHw2WhDDmxH','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('VwtyxU8rYuwxGOkPGTX2c','Dbxx2Q_p7kPeOvtqJpxsY','B861fQQuYzBhd-Mocc33H','maybe');
INSERT INTO "votes" VALUES('z11HkCah3yaO2rEZfW9ya','7_a3qxw4M5vOCynSHpF7M','B861fQQuYzBhd-Mocc33H','maybe');
INSERT INTO "votes" VALUES('IOLGONd85HDUgzPikHBSi','vz9gIngxrD20xdhub4aTA','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('UrC31_5rudkfxkiT7GxFh','3Fah_E9gWz_GfkuanoTRj','B861fQQuYzBhd-Mocc33H','maybe');
INSERT INTO "votes" VALUES('Ks-2eOb6okR0kMeBjRE8D','717l-rDjvWjoRF9dARR5b','B861fQQuYzBhd-Mocc33H','interested');
INSERT INTO "votes" VALUES('rIeO2jHwwCeVQ5RnNK_Fs','AGBEY_njyBy5Q7jRGUZYp','NeVPC4sOIpHAFioNYmgzv','maybe');
INSERT INTO "votes" VALUES('gU2ZWCjyk_GhDkKVtPksw','DiwkZNYszoJ4Y8u2zULZX','NeVPC4sOIpHAFioNYmgzv','maybe');
INSERT INTO "votes" VALUES('qc7B4pYVbrni-dcsL7rSI','7_a3qxw4M5vOCynSHpF7M','NeVPC4sOIpHAFioNYmgzv','interested');
INSERT INTO "votes" VALUES('nSqS1r6Ee8fe8BQeE0Uud','BpCao3_JGp6jKtwibImZS','NeVPC4sOIpHAFioNYmgzv','interested');
INSERT INTO "votes" VALUES('CSA5AcAk9ZiKwzxzRTjho','uRQ9-NLdODTV2O-9ZbqeM','NeVPC4sOIpHAFioNYmgzv','interested');
INSERT INTO "votes" VALUES('WbbSy9pb6ZnCh0XD5-hMI','ZKjvcX-vIAtHw2WhDDmxH','ZDk7oXJvG4aIJGinraw1-','interested');
INSERT INTO "votes" VALUES('ZRcWY82ZO3Ltqu1j2ZBlF','Dbxx2Q_p7kPeOvtqJpxsY','ZDk7oXJvG4aIJGinraw1-','maybe');
INSERT INTO "votes" VALUES('zl_T4gUE5Oq3kbrJo6fEC','kIoZ2VvKhffSCGzA-UzVa','ZDk7oXJvG4aIJGinraw1-','skip');
INSERT INTO "votes" VALUES('Rch_hudte6SP4kjHFxLdD','COVa7UWYU5frFHrOdbm3D','ZDk7oXJvG4aIJGinraw1-','interested');
INSERT INTO "votes" VALUES('8HmzDg3aV8I4-sI9QgWM7','7_a3qxw4M5vOCynSHpF7M','ZDk7oXJvG4aIJGinraw1-','skip');
INSERT INTO "votes" VALUES('pUOJINdUPgRfXKgJPP3Y1','BpCao3_JGp6jKtwibImZS','ZDk7oXJvG4aIJGinraw1-','maybe');
INSERT INTO "votes" VALUES('gtdyiZbRJYRRo67thx9oF','uRQ9-NLdODTV2O-9ZbqeM','ZDk7oXJvG4aIJGinraw1-','maybe');
INSERT INTO "votes" VALUES('i_4Gk_b9NrrOWm1XHJGWt','AGBEY_njyBy5Q7jRGUZYp','EHsKrkDZ1krZzBzmwozA4','skip');
INSERT INTO "votes" VALUES('D51td41of8nfGRDLdnDV9','1vmXq_aklEGRWiKfVvg_O','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('GrwJk1IrfoQpVmWkFSu9N','ZKjvcX-vIAtHw2WhDDmxH','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('zgtwGzo8_2LTYYFotjxt1','EXrWawC1luKRlZx5ikFrv','EHsKrkDZ1krZzBzmwozA4','maybe');
INSERT INTO "votes" VALUES('gm0kJyzd7f1n_kfZ7tSw4','7_a3qxw4M5vOCynSHpF7M','EHsKrkDZ1krZzBzmwozA4','maybe');
INSERT INTO "votes" VALUES('IYBknvSnizUaQTY8XcgNT','4CL_x9jUBerrTq2nZic1y','EHsKrkDZ1krZzBzmwozA4','interested');
INSERT INTO "votes" VALUES('7IEPADDWTjgKrkIXIfmqq','717l-rDjvWjoRF9dARR5b','EHsKrkDZ1krZzBzmwozA4','maybe');
INSERT INTO "votes" VALUES('eEH7KIb62L0UEL-CJu-eH','AGBEY_njyBy5Q7jRGUZYp','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('9sITpJ25WSpZHeibP_G8m','1vmXq_aklEGRWiKfVvg_O','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('iojFbPltcScdhWDuQyOaS','DiwkZNYszoJ4Y8u2zULZX','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('u0QTvYXG6PArIhx6xyKqr','ZKjvcX-vIAtHw2WhDDmxH','XHeT_4Wow9aEWWJG576Kh','maybe');
INSERT INTO "votes" VALUES('jxAPmzu3SueGfpDUYwg9p','Dbxx2Q_p7kPeOvtqJpxsY','XHeT_4Wow9aEWWJG576Kh','skip');
INSERT INTO "votes" VALUES('AtaMmJmQCoskayYGVkIwp','7_a3qxw4M5vOCynSHpF7M','XHeT_4Wow9aEWWJG576Kh','interested');
INSERT INTO "votes" VALUES('6xYOlYXvRjmu_ezEMmNIo','4CL_x9jUBerrTq2nZic1y','XHeT_4Wow9aEWWJG576Kh','maybe');
INSERT INTO "votes" VALUES('5BSm1nMZ114HishBXwcBE','3Fah_E9gWz_GfkuanoTRj','XHeT_4Wow9aEWWJG576Kh','maybe');
INSERT INTO "votes" VALUES('dLCLCqv8XDrHZu1pPkAsb','uRQ9-NLdODTV2O-9ZbqeM','XHeT_4Wow9aEWWJG576Kh','maybe');
INSERT INTO "votes" VALUES('7h3cyk4uRVBlGsgcVGcHg','EXrWawC1luKRlZx5ikFrv','ID7ZhNxS1jNfhPMDxVxJL','skip');
INSERT INTO "votes" VALUES('yHDg2P1hb66NhYPAWkxlL','Dbxx2Q_p7kPeOvtqJpxsY','ID7ZhNxS1jNfhPMDxVxJL','maybe');
INSERT INTO "votes" VALUES('8jeUMcMaZxEgAO6-2LX-a','kIoZ2VvKhffSCGzA-UzVa','ID7ZhNxS1jNfhPMDxVxJL','interested');
INSERT INTO "votes" VALUES('5tGDDE5kJ6psxKvdOxYrT','COVa7UWYU5frFHrOdbm3D','ID7ZhNxS1jNfhPMDxVxJL','interested');
INSERT INTO "votes" VALUES('yvS9pC4BVAWe1Fn4ZaCSL','7_a3qxw4M5vOCynSHpF7M','ID7ZhNxS1jNfhPMDxVxJL','interested');
INSERT INTO "votes" VALUES('D4oDPm8R6y9IckTOwdjR8','vz9gIngxrD20xdhub4aTA','ID7ZhNxS1jNfhPMDxVxJL','interested');
INSERT INTO "votes" VALUES('NRDTvo0jOBw3MluqAzV9_','eVa4GhsKkugwUOCZ5zXF0','ID7ZhNxS1jNfhPMDxVxJL','maybe');
INSERT INTO "votes" VALUES('J_sSb6t83Q6JdiQW3JodT','BpCao3_JGp6jKtwibImZS','ID7ZhNxS1jNfhPMDxVxJL','maybe');
INSERT INTO "votes" VALUES('FOoyw6BYSB04ycaN5YX1U','717l-rDjvWjoRF9dARR5b','ID7ZhNxS1jNfhPMDxVxJL','interested');
INSERT INTO "votes" VALUES('WqivgntpoE0hLH4NmSc2H','TjgBSLfg16pMPiHRyE9Ex','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('I9i9Tq54_Mwz4wjZtsCTg','No5bawBF0YyvML7baPlXm','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('knptqsmHLZ9T0AU1fk-Kd','AGBEY_njyBy5Q7jRGUZYp','q4O1MRMpeQlO0TyrxQd_R','interested');
INSERT INTO "votes" VALUES('PgThBpzSqb7QYizdBv-As','ZKjvcX-vIAtHw2WhDDmxH','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('YZlW5M9bkb5FlrupnDp7c','COVa7UWYU5frFHrOdbm3D','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('k47VZBOlmFibtEw76XNvH','BpCao3_JGp6jKtwibImZS','q4O1MRMpeQlO0TyrxQd_R','maybe');
INSERT INTO "votes" VALUES('Je4LueZBKQr5x7mU7EvPg','DiwkZNYszoJ4Y8u2zULZX','6tQX6-ck20zvyo1Q78kcr','maybe');
INSERT INTO "votes" VALUES('h4xvCEKJPsifqnao2C6bp','EXrWawC1luKRlZx5ikFrv','6tQX6-ck20zvyo1Q78kcr','maybe');
INSERT INTO "votes" VALUES('TeR_bRxB_yzGK1satduoV','kIoZ2VvKhffSCGzA-UzVa','6tQX6-ck20zvyo1Q78kcr','skip');
INSERT INTO "votes" VALUES('q9qJgHkocdQTpi69Sm_Qw','vz9gIngxrD20xdhub4aTA','6tQX6-ck20zvyo1Q78kcr','interested');
INSERT INTO "votes" VALUES('OXdmD1rXHGpqWcrZMbE_U','4CL_x9jUBerrTq2nZic1y','6tQX6-ck20zvyo1Q78kcr','interested');
INSERT INTO "votes" VALUES('hIFPNHvfZxwpDebSjFzlI','ZuzR7zm-8hRB2t-BzRS26','6tQX6-ck20zvyo1Q78kcr','skip');
INSERT INTO "votes" VALUES('xtU1gdXMRg9KVBQ21cTak','eVa4GhsKkugwUOCZ5zXF0','6tQX6-ck20zvyo1Q78kcr','skip');
INSERT INTO "votes" VALUES('RQeyMIjic2-rqMJih-pkL','BpCao3_JGp6jKtwibImZS','6tQX6-ck20zvyo1Q78kcr','interested');
INSERT INTO "votes" VALUES('0VZSu6dcs8sS9kRvZtyTi','uRQ9-NLdODTV2O-9ZbqeM','6tQX6-ck20zvyo1Q78kcr','interested');
INSERT INTO "votes" VALUES('LrjxoNqEvs5O41NXWfqjs','AGBEY_njyBy5Q7jRGUZYp','pM17gpIj2Josz5tiFZ1el','interested');
INSERT INTO "votes" VALUES('7OvcKm6ckJEePAdnN0NFA','ZuzR7zm-8hRB2t-BzRS26','pM17gpIj2Josz5tiFZ1el','maybe');
INSERT INTO "votes" VALUES('63Bz3kjd5M1H-EGANDiDz','717l-rDjvWjoRF9dARR5b','pM17gpIj2Josz5tiFZ1el','skip');
INSERT INTO "votes" VALUES('xDeqJE1OW1l2OMNfoF-Vr','DiwkZNYszoJ4Y8u2zULZX','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('E1fgygS9KssjC2d__WXFs','ZKjvcX-vIAtHw2WhDDmxH','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('5aGjf40HCVvtbpUVmPepr','Dbxx2Q_p7kPeOvtqJpxsY','XC1WD3CPb71Kuu-q4FQEk','maybe');
INSERT INTO "votes" VALUES('rBHmqhfhXsmVVeh6H34-F','4CL_x9jUBerrTq2nZic1y','XC1WD3CPb71Kuu-q4FQEk','maybe');
INSERT INTO "votes" VALUES('Vq2vYw5o36AuQgXC8o4XH','eVa4GhsKkugwUOCZ5zXF0','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('iZ6hyP-F3qJygm3xpMA5s','3Fah_E9gWz_GfkuanoTRj','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('HSwKGSP3t72vG21X6IXJ1','uRQ9-NLdODTV2O-9ZbqeM','XC1WD3CPb71Kuu-q4FQEk','skip');
INSERT INTO "votes" VALUES('1EA8dHfQyfhd7q1iYZ8xM','717l-rDjvWjoRF9dARR5b','XC1WD3CPb71Kuu-q4FQEk','interested');
INSERT INTO "votes" VALUES('jABgguWz3vUW-xsQ9ZzWv','TjgBSLfg16pMPiHRyE9Ex','ZgqjVdi01mWWPTcE6HcFp','interested');
INSERT INTO "votes" VALUES('uSMfpzKqqJEcLtlqipIuY','No5bawBF0YyvML7baPlXm','ZgqjVdi01mWWPTcE6HcFp','skip');
INSERT INTO "votes" VALUES('6kqHE2OJMyDbuROZS8KGT','ZKjvcX-vIAtHw2WhDDmxH','ZgqjVdi01mWWPTcE6HcFp','skip');
INSERT INTO "votes" VALUES('EW7uPugw3NCd4ac9y7Qdg','EXrWawC1luKRlZx5ikFrv','ZgqjVdi01mWWPTcE6HcFp','maybe');
INSERT INTO "votes" VALUES('qQimf-hpTypxQgdjjX1cA','vz9gIngxrD20xdhub4aTA','ZgqjVdi01mWWPTcE6HcFp','maybe');
INSERT INTO "votes" VALUES('tEZj1rAWFg1JjYG4gbko8','eVa4GhsKkugwUOCZ5zXF0','ZgqjVdi01mWWPTcE6HcFp','interested');
INSERT INTO "votes" VALUES('NgpV5XaNfO4uWkXUQV0J6','3Fah_E9gWz_GfkuanoTRj','ZgqjVdi01mWWPTcE6HcFp','maybe');
INSERT INTO "votes" VALUES('B1HTahhT7WNArdUFjVXLs','BpCao3_JGp6jKtwibImZS','ZgqjVdi01mWWPTcE6HcFp','maybe');
INSERT INTO "votes" VALUES('1qH0a_VW62-Z3jxXEStvS','uRQ9-NLdODTV2O-9ZbqeM','ZgqjVdi01mWWPTcE6HcFp','skip');
INSERT INTO "votes" VALUES('QdT2J_NuIcQueAL8UxgK1','717l-rDjvWjoRF9dARR5b','ZgqjVdi01mWWPTcE6HcFp','maybe');
INSERT INTO "votes" VALUES('VyGWsBFlZMXxEzo6Lb3OO','DiwkZNYszoJ4Y8u2zULZX','T3SJUd7xO-unLThU9aPx5','skip');
INSERT INTO "votes" VALUES('8E59SL3NhLn6XJ9wLidos','EXrWawC1luKRlZx5ikFrv','T3SJUd7xO-unLThU9aPx5','maybe');
INSERT INTO "votes" VALUES('f7e2u1nThLKvzO-jiX2H_','COVa7UWYU5frFHrOdbm3D','T3SJUd7xO-unLThU9aPx5','skip');
INSERT INTO "votes" VALUES('YIYMBtgBKkKPU9Y4QD17w','7_a3qxw4M5vOCynSHpF7M','T3SJUd7xO-unLThU9aPx5','skip');
INSERT INTO "votes" VALUES('C9M-aWuzKGyX8hwDbrmei','ZuzR7zm-8hRB2t-BzRS26','T3SJUd7xO-unLThU9aPx5','interested');
INSERT INTO "votes" VALUES('g6YDquPvO7s9Apf-WNLXb','eVa4GhsKkugwUOCZ5zXF0','T3SJUd7xO-unLThU9aPx5','interested');
INSERT INTO "votes" VALUES('meRF3riI0C8TV86ZgMlll','uRQ9-NLdODTV2O-9ZbqeM','T3SJUd7xO-unLThU9aPx5','skip');
INSERT INTO "votes" VALUES('iTJQc4kLinQJ7XAlQhGGl','1vmXq_aklEGRWiKfVvg_O','oYpHhelks-_fMgSi8Ynqv','maybe');
INSERT INTO "votes" VALUES('LlfPw51JPzWb3DP0DGpQb','DiwkZNYszoJ4Y8u2zULZX','oYpHhelks-_fMgSi8Ynqv','maybe');
INSERT INTO "votes" VALUES('PfNqKN89zxgl7tSGh7gzn','ZKjvcX-vIAtHw2WhDDmxH','oYpHhelks-_fMgSi8Ynqv','skip');
INSERT INTO "votes" VALUES('wHCM7rrnqKWd1hxS32-ba','kIoZ2VvKhffSCGzA-UzVa','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('IB6V6qNUYXzvfCyvcczad','COVa7UWYU5frFHrOdbm3D','oYpHhelks-_fMgSi8Ynqv','interested');
INSERT INTO "votes" VALUES('6bHzRfp3ZND0S1Jv58OQK','BpCao3_JGp6jKtwibImZS','oYpHhelks-_fMgSi8Ynqv','maybe');
INSERT INTO "votes" VALUES('Wzv1NNTW2ipG5q-b9EDnB','Dbxx2Q_p7kPeOvtqJpxsY','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('SyfX6wuACmm-kXp-tRrib','kIoZ2VvKhffSCGzA-UzVa','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('9m1_ufKth6M3t4YFabL-i','4CL_x9jUBerrTq2nZic1y','z1l8a7TPL4zOpBWrrc70v','maybe');
INSERT INTO "votes" VALUES('NQDzBw5BbuDniCWlgVJK7','BpCao3_JGp6jKtwibImZS','z1l8a7TPL4zOpBWrrc70v','interested');
INSERT INTO "votes" VALUES('tikce5lC5QwjrCW_5cjbD','kIoZ2VvKhffSCGzA-UzVa','p_M18sKsYk7UORNvRFhR1','maybe');
INSERT INTO "votes" VALUES('Pk21QXz-tzB-w3aUHDeCe','COVa7UWYU5frFHrOdbm3D','p_M18sKsYk7UORNvRFhR1','interested');
INSERT INTO "votes" VALUES('P4if5v6R-LVPbAdIDcFGS','4CL_x9jUBerrTq2nZic1y','p_M18sKsYk7UORNvRFhR1','interested');
INSERT INTO "votes" VALUES('VQ7SyF4qxYr2pHehV2qsM','ZuzR7zm-8hRB2t-BzRS26','p_M18sKsYk7UORNvRFhR1','skip');
INSERT INTO "votes" VALUES('O8NmGSTR0cOE_ZpJ-KTlh','eVa4GhsKkugwUOCZ5zXF0','p_M18sKsYk7UORNvRFhR1','skip');
INSERT INTO "votes" VALUES('sgVKg5afi03UJk1KG7XqM','No5bawBF0YyvML7baPlXm','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('IK7aFCS5FW4es2tlCB3jZ','DiwkZNYszoJ4Y8u2zULZX','6Ytgf3DnS_Km7Pa5yoXDa','maybe');
INSERT INTO "votes" VALUES('0JMcEyYD8Ufvb0ibYhkDl','ZKjvcX-vIAtHw2WhDDmxH','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('ZffAkVwa90dzUTpb1GZ7H','ZuzR7zm-8hRB2t-BzRS26','6Ytgf3DnS_Km7Pa5yoXDa','interested');
INSERT INTO "votes" VALUES('k7KBMab6jiFMHBQnjsNJg','3Fah_E9gWz_GfkuanoTRj','6Ytgf3DnS_Km7Pa5yoXDa','skip');
INSERT INTO "votes" VALUES('avOYqauzmx7SlH3K4D2Jl','TjgBSLfg16pMPiHRyE9Ex','qiyX-HGyolJOsfDOFmuLQ','skip');
INSERT INTO "votes" VALUES('oNoLj0K1qu0KQH2i9e5Q5','No5bawBF0YyvML7baPlXm','qiyX-HGyolJOsfDOFmuLQ','maybe');
INSERT INTO "votes" VALUES('w_2gw9rbvD6JIgrlF-GZ9','EXrWawC1luKRlZx5ikFrv','qiyX-HGyolJOsfDOFmuLQ','skip');
INSERT INTO "votes" VALUES('cKX3q-iZv5LbNVTtOQvog','kIoZ2VvKhffSCGzA-UzVa','qiyX-HGyolJOsfDOFmuLQ','interested');
INSERT INTO "votes" VALUES('czLQjA2xxcZT5AClHQnDR','4CL_x9jUBerrTq2nZic1y','qiyX-HGyolJOsfDOFmuLQ','skip');
INSERT INTO "votes" VALUES('o5EJTZ2e0exnSSNlHFXth','eVa4GhsKkugwUOCZ5zXF0','qiyX-HGyolJOsfDOFmuLQ','skip');
INSERT INTO "votes" VALUES('VZIE2703g51urGW-o6XDC','717l-rDjvWjoRF9dARR5b','qiyX-HGyolJOsfDOFmuLQ','maybe');
INSERT INTO "votes" VALUES('Yqm-O60xP264X_UeH4UOF','No5bawBF0YyvML7baPlXm','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('K--OZpOfWvxN2REnw7K6O','AGBEY_njyBy5Q7jRGUZYp','RH72K1YnCL9U6GaoBIZ3A','interested');
INSERT INTO "votes" VALUES('kr8QEMah7dJPcsIttXNDs','COVa7UWYU5frFHrOdbm3D','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('j2HtFb9P_Ro5HJl8Ledtp','7_a3qxw4M5vOCynSHpF7M','RH72K1YnCL9U6GaoBIZ3A','interested');
INSERT INTO "votes" VALUES('eSxAE7dq9gMogpj1NVG_x','vz9gIngxrD20xdhub4aTA','RH72K1YnCL9U6GaoBIZ3A','skip');
INSERT INTO "votes" VALUES('zpjvEfxYCf_qhvvrb7c1h','BpCao3_JGp6jKtwibImZS','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('SX7CQulCTyfpzo7MJy95J','uRQ9-NLdODTV2O-9ZbqeM','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('EYBC4VOi4rQJykp0bPl6M','717l-rDjvWjoRF9dARR5b','RH72K1YnCL9U6GaoBIZ3A','maybe');
INSERT INTO "votes" VALUES('YANNj1h2rJ2U0Xtsa2VeX','TjgBSLfg16pMPiHRyE9Ex','CO4-kIGmWGDbsH-ZNRVfp','skip');
INSERT INTO "votes" VALUES('5hJw930kjioo3qSbRfFjg','No5bawBF0YyvML7baPlXm','CO4-kIGmWGDbsH-ZNRVfp','interested');
INSERT INTO "votes" VALUES('MbLaGIDYwSFxGhwBpJW8v','Dbxx2Q_p7kPeOvtqJpxsY','CO4-kIGmWGDbsH-ZNRVfp','maybe');
INSERT INTO "votes" VALUES('mx2iJBY8v981qU7A6QScK','vz9gIngxrD20xdhub4aTA','CO4-kIGmWGDbsH-ZNRVfp','interested');
INSERT INTO "votes" VALUES('mEPgKZwMZfNGlZiDBDZPY','4CL_x9jUBerrTq2nZic1y','CO4-kIGmWGDbsH-ZNRVfp','maybe');
INSERT INTO "votes" VALUES('zQaJDgs3l4LL8Lv28z8Gi','ZuzR7zm-8hRB2t-BzRS26','CO4-kIGmWGDbsH-ZNRVfp','maybe');
INSERT INTO "votes" VALUES('F2mHd2OhPCPHnJaFsbjTG','BpCao3_JGp6jKtwibImZS','CO4-kIGmWGDbsH-ZNRVfp','maybe');
INSERT INTO "votes" VALUES('tBC3-K3tIReGFRPhIeqIg','TjgBSLfg16pMPiHRyE9Ex','u4sh60Jtyei1yRqfuvWhq','interested');
INSERT INTO "votes" VALUES('d7hJ0bToiLO9uKFRBUTOI','1vmXq_aklEGRWiKfVvg_O','u4sh60Jtyei1yRqfuvWhq','interested');
INSERT INTO "votes" VALUES('5_5eDgUSRQSUggLjT3zw8','ZKjvcX-vIAtHw2WhDDmxH','u4sh60Jtyei1yRqfuvWhq','skip');
INSERT INTO "votes" VALUES('jxElUYE552vy2n7kCuKaU','Dbxx2Q_p7kPeOvtqJpxsY','u4sh60Jtyei1yRqfuvWhq','skip');
INSERT INTO "votes" VALUES('Xi0YMUoVXjo1zCe6WNYzT','kIoZ2VvKhffSCGzA-UzVa','u4sh60Jtyei1yRqfuvWhq','maybe');
INSERT INTO "votes" VALUES('rKI5o8jqXd3tAOOUN8RhQ','7_a3qxw4M5vOCynSHpF7M','u4sh60Jtyei1yRqfuvWhq','skip');
INSERT INTO "votes" VALUES('2PWxh4rseACAakojQZpdr','uRQ9-NLdODTV2O-9ZbqeM','u4sh60Jtyei1yRqfuvWhq','interested');
INSERT INTO "votes" VALUES('8GlYDySnZtuzdvCTklxKz','No5bawBF0YyvML7baPlXm','fqiG3ELvXNV3ZXgLKURZ7','maybe');
INSERT INTO "votes" VALUES('WsPL1NHJURLfu6lVdjuG6','ZKjvcX-vIAtHw2WhDDmxH','fqiG3ELvXNV3ZXgLKURZ7','skip');
INSERT INTO "votes" VALUES('l84n3HkqzlTpbCExbqatE','Dbxx2Q_p7kPeOvtqJpxsY','fqiG3ELvXNV3ZXgLKURZ7','skip');
INSERT INTO "votes" VALUES('aoV-KoQZ_33dmUvCvi5es','kIoZ2VvKhffSCGzA-UzVa','fqiG3ELvXNV3ZXgLKURZ7','maybe');
INSERT INTO "votes" VALUES('Bu6F7AvQFFE57CvgJjKAX','COVa7UWYU5frFHrOdbm3D','fqiG3ELvXNV3ZXgLKURZ7','maybe');
INSERT INTO "votes" VALUES('TGKmstiXciIj861dBvaMs','eVa4GhsKkugwUOCZ5zXF0','fqiG3ELvXNV3ZXgLKURZ7','interested');
INSERT INTO "votes" VALUES('XQwTaOiTBSnY0YtV7_3rG','uRQ9-NLdODTV2O-9ZbqeM','fqiG3ELvXNV3ZXgLKURZ7','interested');
INSERT INTO "votes" VALUES('sBSM8NWZ20jbGEKyqy7b1','AGBEY_njyBy5Q7jRGUZYp','_KDPWE7W8XHyCGdW1Jqz0','maybe');
INSERT INTO "votes" VALUES('sBCMEHY8RkP9RoqiO3Pqc','DiwkZNYszoJ4Y8u2zULZX','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('wUbW9j8Lu5sy1Xg96f5zI','ZKjvcX-vIAtHw2WhDDmxH','_KDPWE7W8XHyCGdW1Jqz0','maybe');
INSERT INTO "votes" VALUES('ofhJKQSwvW9L3_Zi0FonU','kIoZ2VvKhffSCGzA-UzVa','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('hF2Uhad9i5PfVSzuBG3ch','7_a3qxw4M5vOCynSHpF7M','_KDPWE7W8XHyCGdW1Jqz0','maybe');
INSERT INTO "votes" VALUES('iNBGSpd83wJ_K5W2iBRi-','3Fah_E9gWz_GfkuanoTRj','_KDPWE7W8XHyCGdW1Jqz0','interested');
INSERT INTO "votes" VALUES('OT26Ma3baV2wGJmno7XR7','AGBEY_njyBy5Q7jRGUZYp','2tq-6-EBPhS296h5jaN3w','maybe');
INSERT INTO "votes" VALUES('mVd-SqswMIIIcJ0CmeyHx','1vmXq_aklEGRWiKfVvg_O','2tq-6-EBPhS296h5jaN3w','interested');
INSERT INTO "votes" VALUES('Kd8fC3V9rxA-SsZ11kF97','DiwkZNYszoJ4Y8u2zULZX','2tq-6-EBPhS296h5jaN3w','skip');
INSERT INTO "votes" VALUES('Avzh4DP5FETCOU4HxLk4u','ZKjvcX-vIAtHw2WhDDmxH','2tq-6-EBPhS296h5jaN3w','maybe');
INSERT INTO "votes" VALUES('wjYc5uAtrKZNKm6-c3jl9','Dbxx2Q_p7kPeOvtqJpxsY','2tq-6-EBPhS296h5jaN3w','skip');
INSERT INTO "votes" VALUES('mdeiN6Ufe1vMnyQVyxEVw','COVa7UWYU5frFHrOdbm3D','2tq-6-EBPhS296h5jaN3w','interested');
INSERT INTO "votes" VALUES('JuR9dXBOD7yIulKops1d1','7_a3qxw4M5vOCynSHpF7M','2tq-6-EBPhS296h5jaN3w','interested');
INSERT INTO "votes" VALUES('c6gKB2bfCRp2C2RDH3oiD','vz9gIngxrD20xdhub4aTA','2tq-6-EBPhS296h5jaN3w','interested');
INSERT INTO "votes" VALUES('QnTKeD6Ufo3NLLY7-W8po','3Fah_E9gWz_GfkuanoTRj','2tq-6-EBPhS296h5jaN3w','skip');
INSERT INTO "votes" VALUES('jbk7PalXJssHywwea6Yun','717l-rDjvWjoRF9dARR5b','2tq-6-EBPhS296h5jaN3w','maybe');
INSERT INTO "votes" VALUES('UK34-IgHCs1VSbeq6P_T_','TjgBSLfg16pMPiHRyE9Ex','4NihDOqv7M8nE5B5bF85j','skip');
INSERT INTO "votes" VALUES('ZkCdEEdUZLC9xUXoPxthH','DiwkZNYszoJ4Y8u2zULZX','4NihDOqv7M8nE5B5bF85j','skip');
INSERT INTO "votes" VALUES('SkVbYNd2sx83YXi73qQ46','ZKjvcX-vIAtHw2WhDDmxH','4NihDOqv7M8nE5B5bF85j','maybe');
INSERT INTO "votes" VALUES('3NrONu0pY7jiafJaBK_oq','EXrWawC1luKRlZx5ikFrv','4NihDOqv7M8nE5B5bF85j','maybe');
INSERT INTO "votes" VALUES('Lti6lv9x2nOLvFjBqDuPv','7_a3qxw4M5vOCynSHpF7M','4NihDOqv7M8nE5B5bF85j','interested');
INSERT INTO "votes" VALUES('LLM5bl86oyUja61d_XRk4','uRQ9-NLdODTV2O-9ZbqeM','4NihDOqv7M8nE5B5bF85j','skip');
INSERT INTO "votes" VALUES('wAGw6G9b7d1bzadTPPQhI','717l-rDjvWjoRF9dARR5b','4NihDOqv7M8nE5B5bF85j','skip');
INSERT INTO "votes" VALUES('8jmGdbWwji7pBVjKXwFdI','No5bawBF0YyvML7baPlXm','tas_A2j6mnCwRp25e7zqv','interested');
INSERT INTO "votes" VALUES('DeQ1Z6iQaulsWwlvVVM0q','AGBEY_njyBy5Q7jRGUZYp','tas_A2j6mnCwRp25e7zqv','maybe');
INSERT INTO "votes" VALUES('Q5_9lgSuC7CpnVS9OYR_W','717l-rDjvWjoRF9dARR5b','tas_A2j6mnCwRp25e7zqv','maybe');
INSERT INTO "votes" VALUES('lCKyO9zDcbhhLlyOqDyrS','No5bawBF0YyvML7baPlXm','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('pXBshEdpwa90gL1SPSji8','1vmXq_aklEGRWiKfVvg_O','653Laslo-7HV4UdR60VwR','interested');
INSERT INTO "votes" VALUES('T-7rucQ6gwiAC9BX6nnIO','DiwkZNYszoJ4Y8u2zULZX','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('91PNS3GhRZRrXajlOBdLL','ZKjvcX-vIAtHw2WhDDmxH','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('Ogu_PJiir85ECEdUn-dWz','Dbxx2Q_p7kPeOvtqJpxsY','653Laslo-7HV4UdR60VwR','skip');
INSERT INTO "votes" VALUES('-drqi4rUf_xB5mf4jyILT','eVa4GhsKkugwUOCZ5zXF0','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('nPvYF0JGDXDQbkZCvmP-I','3Fah_E9gWz_GfkuanoTRj','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('drHZjfp23Q6X_czx3RQO6','BpCao3_JGp6jKtwibImZS','653Laslo-7HV4UdR60VwR','skip');
INSERT INTO "votes" VALUES('AsHmxC2LccNZx1MWk4Qbf','uRQ9-NLdODTV2O-9ZbqeM','653Laslo-7HV4UdR60VwR','maybe');
INSERT INTO "votes" VALUES('MBG3B_OWA1T2Veuz4bWY8','AGBEY_njyBy5Q7jRGUZYp','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('6pyhrJfrUPqg3G2WSqcBk','EXrWawC1luKRlZx5ikFrv','cO2_Nc0x7m8d-gkVyu-yp','maybe');
INSERT INTO "votes" VALUES('80pme-tFoL2YZbSWUbWcA','Dbxx2Q_p7kPeOvtqJpxsY','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('7Tx1FIf4rFasM2U-zulqm','kIoZ2VvKhffSCGzA-UzVa','cO2_Nc0x7m8d-gkVyu-yp','maybe');
INSERT INTO "votes" VALUES('K_0UGEjEV6pqWKlUjRbUZ','COVa7UWYU5frFHrOdbm3D','cO2_Nc0x7m8d-gkVyu-yp','maybe');
INSERT INTO "votes" VALUES('u9xqEvNJWZTR4ER1gUSI7','4CL_x9jUBerrTq2nZic1y','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('C7POHqGMzp3E90QM3WsLn','eVa4GhsKkugwUOCZ5zXF0','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('BOVyGyByZE6RlB5hc8LkW','3Fah_E9gWz_GfkuanoTRj','cO2_Nc0x7m8d-gkVyu-yp','interested');
INSERT INTO "votes" VALUES('BV4w6Q668OWSQ0vKQeRGn','717l-rDjvWjoRF9dARR5b','cO2_Nc0x7m8d-gkVyu-yp','skip');
INSERT INTO "votes" VALUES('ttXY5YFshzxqo16jOAG6F','TjgBSLfg16pMPiHRyE9Ex','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('s99l_-MszBbycvv7nV_nn','AGBEY_njyBy5Q7jRGUZYp','hFSVi1NdhxC0ZStQE5ZZX','skip');
INSERT INTO "votes" VALUES('ULn2DkgBP-EO1oKrtaCdv','COVa7UWYU5frFHrOdbm3D','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('hplodTyTGxPFkCA_5XOUh','4CL_x9jUBerrTq2nZic1y','hFSVi1NdhxC0ZStQE5ZZX','maybe');
INSERT INTO "votes" VALUES('z-zZxk-HDeDdVVVIIrlaY','uRQ9-NLdODTV2O-9ZbqeM','hFSVi1NdhxC0ZStQE5ZZX','interested');
INSERT INTO "votes" VALUES('lqSC1mABw0bRUzYDbfZmN','TjgBSLfg16pMPiHRyE9Ex','b_LuQUObIIxcv_Mlg7gvo','interested');
INSERT INTO "votes" VALUES('4VTzJlMvAXuOLdGl8D45p','1vmXq_aklEGRWiKfVvg_O','b_LuQUObIIxcv_Mlg7gvo','interested');
INSERT INTO "votes" VALUES('2tFUcPkBVM-Y6lOmTxM4p','ZKjvcX-vIAtHw2WhDDmxH','b_LuQUObIIxcv_Mlg7gvo','skip');
INSERT INTO "votes" VALUES('JzdTcdXYkt2p52aIY39un','EXrWawC1luKRlZx5ikFrv','b_LuQUObIIxcv_Mlg7gvo','maybe');
INSERT INTO "votes" VALUES('lPcb-zOaky_4Nxc_4QYvx','Dbxx2Q_p7kPeOvtqJpxsY','b_LuQUObIIxcv_Mlg7gvo','maybe');
INSERT INTO "votes" VALUES('cKCMjDsHmk24lCTFbzxqY','vz9gIngxrD20xdhub4aTA','b_LuQUObIIxcv_Mlg7gvo','interested');
INSERT INTO "votes" VALUES('HlRWP-I1hLlzqL0kLS14k','4CL_x9jUBerrTq2nZic1y','b_LuQUObIIxcv_Mlg7gvo','interested');
INSERT INTO "votes" VALUES('ljMzOiSW5OgVlY7dq_o7j','No5bawBF0YyvML7baPlXm','Ljq2361xA-6AtdyIXl1D0','maybe');
INSERT INTO "votes" VALUES('taQRoO6Wk2QlR1k63ibx5','DiwkZNYszoJ4Y8u2zULZX','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('3nr5u2Eh1dqncBmoaqoV6','ZKjvcX-vIAtHw2WhDDmxH','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('Wpoo-7D03t_Rgumrz6zSF','Dbxx2Q_p7kPeOvtqJpxsY','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('Kr-sWGx8xA98TMO1mFND0','kIoZ2VvKhffSCGzA-UzVa','Ljq2361xA-6AtdyIXl1D0','maybe');
INSERT INTO "votes" VALUES('dz25XKudnjNkU0apF_k0l','COVa7UWYU5frFHrOdbm3D','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('lDCVG32u52m0NV3pJPGWg','7_a3qxw4M5vOCynSHpF7M','Ljq2361xA-6AtdyIXl1D0','skip');
INSERT INTO "votes" VALUES('FwH_71m6WAIet_X6f1--g','ZuzR7zm-8hRB2t-BzRS26','Ljq2361xA-6AtdyIXl1D0','maybe');
INSERT INTO "votes" VALUES('MmUI9FMg0vt6wGck47dyP','3Fah_E9gWz_GfkuanoTRj','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('LWIQqz1w0O7uRKHC01srP','717l-rDjvWjoRF9dARR5b','Ljq2361xA-6AtdyIXl1D0','interested');
INSERT INTO "votes" VALUES('b2sg1dhLPVAho58WosBcg','COVa7UWYU5frFHrOdbm3D','MvNRNQmDDalIVOqCGUwcA','skip');
INSERT INTO "votes" VALUES('zvDpWAy_odQp6J4636yFG','7_a3qxw4M5vOCynSHpF7M','MvNRNQmDDalIVOqCGUwcA','interested');
INSERT INTO "votes" VALUES('EMwDbdFV8C3iradaucNHv','vz9gIngxrD20xdhub4aTA','MvNRNQmDDalIVOqCGUwcA','skip');
INSERT INTO "votes" VALUES('9ybfdXUvpvjlMPAgkwYq5','ZuzR7zm-8hRB2t-BzRS26','MvNRNQmDDalIVOqCGUwcA','maybe');
INSERT INTO "votes" VALUES('-OOjI4n1ADR3xoLG2afPY','eVa4GhsKkugwUOCZ5zXF0','MvNRNQmDDalIVOqCGUwcA','maybe');
INSERT INTO "votes" VALUES('4bQgEuUgvJzDjuF3qqGTh','BpCao3_JGp6jKtwibImZS','MvNRNQmDDalIVOqCGUwcA','skip');
INSERT INTO "votes" VALUES('rTsp5O1xHSkwxGjoRFUoH','717l-rDjvWjoRF9dARR5b','MvNRNQmDDalIVOqCGUwcA','maybe');
INSERT INTO "votes" VALUES('ZIPPkpreVHlZZA4iMCk_v','AGBEY_njyBy5Q7jRGUZYp','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('aB1KtzHrm7nVAjZ2MfKOl','1vmXq_aklEGRWiKfVvg_O','hIsmJgBfZiWowD4PxpfKb','interested');
INSERT INTO "votes" VALUES('nOWb2kKaqJJR4az4V2qnA','DiwkZNYszoJ4Y8u2zULZX','hIsmJgBfZiWowD4PxpfKb','interested');
INSERT INTO "votes" VALUES('c2_xsxQxegH9CfFSCV9CK','EXrWawC1luKRlZx5ikFrv','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('lNHbwaVyi6f29P93zTnWd','Dbxx2Q_p7kPeOvtqJpxsY','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('YQNNJPeqYfMqhclyFOicQ','COVa7UWYU5frFHrOdbm3D','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('qG1octEJmDhJTSrCa9vJg','vz9gIngxrD20xdhub4aTA','hIsmJgBfZiWowD4PxpfKb','interested');
INSERT INTO "votes" VALUES('jdYD-IvXxXFqP3NL0-teu','uRQ9-NLdODTV2O-9ZbqeM','hIsmJgBfZiWowD4PxpfKb','maybe');
INSERT INTO "votes" VALUES('oraLxkYMSSvTD5YpVSmDJ','TjgBSLfg16pMPiHRyE9Ex','GmxREzYZDWHhdE3YJBkly','maybe');
INSERT INTO "votes" VALUES('mv3VLi9SNAZdDILYuMyiX','No5bawBF0YyvML7baPlXm','GmxREzYZDWHhdE3YJBkly','maybe');
INSERT INTO "votes" VALUES('LE2x1rN8d1fZZCe3_w8wM','Dbxx2Q_p7kPeOvtqJpxsY','GmxREzYZDWHhdE3YJBkly','interested');
INSERT INTO "votes" VALUES('ubqX2Y29HONjJ0YQwqaeN','7_a3qxw4M5vOCynSHpF7M','GmxREzYZDWHhdE3YJBkly','maybe');
INSERT INTO "votes" VALUES('VE-J82iQVjY748QsZOCpq','vz9gIngxrD20xdhub4aTA','GmxREzYZDWHhdE3YJBkly','maybe');
INSERT INTO "votes" VALUES('t1IKFtmK5o_xUwlr9ORu2','BpCao3_JGp6jKtwibImZS','GmxREzYZDWHhdE3YJBkly','interested');
INSERT INTO "votes" VALUES('kPl9qE6uczvOTf_dBa-H3','717l-rDjvWjoRF9dARR5b','GmxREzYZDWHhdE3YJBkly','interested');
INSERT INTO "votes" VALUES('UiAOviXF7XGcnnloHX3Ip','1vmXq_aklEGRWiKfVvg_O','2LWBMof-CEnu7UbVFhthf','skip');
INSERT INTO "votes" VALUES('97l_FAFAwGuQJ3IXwrxXy','ZKjvcX-vIAtHw2WhDDmxH','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('PppkTJDf64XjuBUBM3wlq','kIoZ2VvKhffSCGzA-UzVa','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('auAeSTt4DC_soThJP5sBM','7_a3qxw4M5vOCynSHpF7M','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('hmQt-6Kek_gTjGBHUoGF2','ZuzR7zm-8hRB2t-BzRS26','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('M5tRtpFpGCjkSTsEgXRwB','3Fah_E9gWz_GfkuanoTRj','2LWBMof-CEnu7UbVFhthf','skip');
INSERT INTO "votes" VALUES('q-EAYdAQTaKOqL5FEfjHC','BpCao3_JGp6jKtwibImZS','2LWBMof-CEnu7UbVFhthf','skip');
INSERT INTO "votes" VALUES('zcyBAA6XfkgwoFg85w4Xc','uRQ9-NLdODTV2O-9ZbqeM','2LWBMof-CEnu7UbVFhthf','interested');
INSERT INTO "votes" VALUES('Bq9M7xqbjiZqJlHEs6Dpx','717l-rDjvWjoRF9dARR5b','2LWBMof-CEnu7UbVFhthf','maybe');
INSERT INTO "votes" VALUES('AS2IS_U1RrxwY9tGQ-Af1','TjgBSLfg16pMPiHRyE9Ex','v-v-ZCiBTuQ6DTuwf5Uvx','skip');
INSERT INTO "votes" VALUES('b4NaoZ9y63hv08v8rXm72','1vmXq_aklEGRWiKfVvg_O','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('kA2GcC9cxblyB2GOq__as','EXrWawC1luKRlZx5ikFrv','v-v-ZCiBTuQ6DTuwf5Uvx','skip');
INSERT INTO "votes" VALUES('DWc1Dky2rW_rM0kOx2BF1','kIoZ2VvKhffSCGzA-UzVa','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('O8Zb98WrOC6Isvp_GzGr3','7_a3qxw4M5vOCynSHpF7M','v-v-ZCiBTuQ6DTuwf5Uvx','maybe');
INSERT INTO "votes" VALUES('KcQKQOdOLuDR7pLsxH5hL','4CL_x9jUBerrTq2nZic1y','v-v-ZCiBTuQ6DTuwf5Uvx','maybe');
INSERT INTO "votes" VALUES('lQMaU-t1D2AeKRk3_8GIa','eVa4GhsKkugwUOCZ5zXF0','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('gnx4Rde09d1Sd5JcF_z8B','uRQ9-NLdODTV2O-9ZbqeM','v-v-ZCiBTuQ6DTuwf5Uvx','interested');
INSERT INTO "votes" VALUES('q65ENTA-8PwF4lbsO7Ak9','TjgBSLfg16pMPiHRyE9Ex','zeC7AGyqkuMKpY5WxbckT','skip');
INSERT INTO "votes" VALUES('szBjfm099EuigdyA8EpvM','AGBEY_njyBy5Q7jRGUZYp','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('u7EU4m39JBpzNWM2R2cka','COVa7UWYU5frFHrOdbm3D','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('exiRiYFesbyOQzX6ac_aR','vz9gIngxrD20xdhub4aTA','zeC7AGyqkuMKpY5WxbckT','skip');
INSERT INTO "votes" VALUES('pVn3CnPBIehuqjz2TUuHs','ZuzR7zm-8hRB2t-BzRS26','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('wjsQNfWLAnmbfLgkA6_A9','eVa4GhsKkugwUOCZ5zXF0','zeC7AGyqkuMKpY5WxbckT','skip');
INSERT INTO "votes" VALUES('4A7YeB1J9N9d4pBPmFKnJ','uRQ9-NLdODTV2O-9ZbqeM','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('dvD209QHxQM0w84uEu6bN','717l-rDjvWjoRF9dARR5b','zeC7AGyqkuMKpY5WxbckT','interested');
INSERT INTO "votes" VALUES('bpaXPMsvceom6AkyQMkY9','No5bawBF0YyvML7baPlXm','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('e6UEkdvBekMaIvCTMJiGA','AGBEY_njyBy5Q7jRGUZYp','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('P2lhnXakYcI1NaWZhRxC-','1vmXq_aklEGRWiKfVvg_O','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('Y0QudXXbqxWa1n3qGpMtr','ZKjvcX-vIAtHw2WhDDmxH','rJhXeJVBKd4Lll0FKaIWo','skip');
INSERT INTO "votes" VALUES('v084to80UoxJ7N59CUASL','kIoZ2VvKhffSCGzA-UzVa','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('StqGqc2yA2kfCBqcMDBVl','COVa7UWYU5frFHrOdbm3D','rJhXeJVBKd4Lll0FKaIWo','maybe');
INSERT INTO "votes" VALUES('v0YbhxRGgKRVvRlteytFE','7_a3qxw4M5vOCynSHpF7M','rJhXeJVBKd4Lll0FKaIWo','interested');
INSERT INTO "votes" VALUES('teHbvM7ZXpuoQrBeM-rgk','717l-rDjvWjoRF9dARR5b','rJhXeJVBKd4Lll0FKaIWo','skip');
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
, `slot_increment_minutes` integer DEFAULT 30 NOT NULL, `rsvp_capacity_hard_limit` integer DEFAULT false NOT NULL, `meetings_enabled` integer DEFAULT false NOT NULL, `max_open_meeting_requests` integer DEFAULT 5 NOT NULL, `version` integer DEFAULT 1 NOT NULL, `identity_mode` text DEFAULT 'open' NOT NULL, `proposal_help` text DEFAULT '' NOT NULL, `read_access` text DEFAULT 'public' NOT NULL, `link_token` text DEFAULT '' NOT NULL, `kiosk_token` text DEFAULT '' NOT NULL);
INSERT INTO "events" VALUES('tCNQtXjwgJKS47DHOu32C','Hackathon','Hackathon','Dev Week ends with three days of building things together, right after the Open Source Summit. Bring a project that needs hands or an idea you want to try; the programme is whatever attendees propose.','https://devweek.example.com/hackathon','2026-11-15T18:53:08.480Z','2026-11-29T18:53:08.480Z','2026-11-29T18:53:08.480Z','2026-12-06T18:53:08.480Z','2026-12-06T18:53:08.480Z','2026-12-15T17:00:00.000Z',120,10,'Europe/Berlin','WrenchIcon',30,0,1,5,1,'open','','public','1a983f84cf0c9d077788d930a95b619e','8cb5d8ad535023c039f9103f161f8762');
INSERT INTO "events" VALUES('y74c07QXIkssDeblYsOSY','Open Source Summit','Open-Source-Summit','The middle of Dev Week: three days on **maintaining, funding and growing open source projects**, starting the morning after the Web Unconference party. Vote for the sessions you want to see, and find travel tips on the [Dev Week website](https://devweek.example.com).','https://devweek.example.com/open-source-summit','2026-11-01T18:53:08.480Z','2026-11-15T18:53:08.480Z','2026-11-15T18:53:08.480Z','2026-11-29T18:53:08.480Z','2026-11-29T18:53:08.480Z','2026-12-12T17:00:00.000Z',120,10,'Europe/Berlin','UserGroupIcon',30,0,1,5,1,'open','','public','20eb5b50049cf902c96d7d8a927bfbee','caf0affaefbf3eab06309679738309fd');
INSERT INTO "events" VALUES('PPGDvamTBn3-mmtGaFpIs','Web Unconference','Web-Unconference','Dev Week opens with three days of talks, workshops and hallway conversations about building for the web, ending with a party on the last night. The Open Source Summit and the Hackathon follow at the same venue.

### Quick links

- [Venue map](https://devweek.example.com/map)
- [Code of conduct](https://devweek.example.com/coc)','https://devweek.example.com/web-unconference','2026-10-18T17:53:08.480Z','2026-11-01T18:53:08.480Z','2026-11-01T18:53:08.480Z','2026-11-15T18:53:08.480Z','2026-11-15T18:53:08.480Z','2026-12-09T02:00:00.000Z',120,10,'Europe/Berlin','GlobeAltIcon',30,0,1,5,1,'open','','public','31f87117e88e86dc3281c6b025c3489e','1daa76ed0217c96222626a113173f323');
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
INSERT INTO "sessions" VALUES('3ZLdpsn4gv5MTBRXvfV0R','Opening Keynote - Hackathon','Welcome to Hackathon','2026-12-13T08:00:00.000Z','2026-12-13T09:30:00.000Z',100,1,0,0,NULL,'tCNQtXjwgJKS47DHOu32C',NULL,1);
INSERT INTO "sessions" VALUES('zUke6Fq8eKDGuiqCIOM-K','Lunch Break','','2026-12-13T11:30:00.000Z','2026-12-13T13:00:00.000Z',0,1,1,0,NULL,'tCNQtXjwgJKS47DHOu32C',NULL,1);
INSERT INTO "sessions" VALUES('Im8TghvUKvWEfX_zHptUC','Lunch Break','','2026-12-14T11:30:00.000Z','2026-12-14T13:00:00.000Z',0,1,1,0,NULL,'tCNQtXjwgJKS47DHOu32C',NULL,1);
INSERT INTO "sessions" VALUES('K7wA1G0LtUA7PNHS6qawb','Lunch Break','','2026-12-15T11:30:00.000Z','2026-12-15T13:00:00.000Z',0,1,1,0,NULL,'tCNQtXjwgJKS47DHOu32C',NULL,1);
INSERT INTO "sessions" VALUES('nYpqOeRPOYoZgLb6k8hCT','Opening Keynote - Open Source Summit','Welcome to Open Source Summit','2026-12-10T08:00:00.000Z','2026-12-10T09:30:00.000Z',100,1,0,0,NULL,'y74c07QXIkssDeblYsOSY',NULL,1);
INSERT INTO "sessions" VALUES('5gh0RI7wMMAlu0VHWLdlG','Lunch Break','','2026-12-10T11:30:00.000Z','2026-12-10T13:00:00.000Z',0,1,1,0,NULL,'y74c07QXIkssDeblYsOSY',NULL,1);
INSERT INTO "sessions" VALUES('zygaoOBil2tE9dhyibo0W','Lunch Break','','2026-12-11T11:30:00.000Z','2026-12-11T13:00:00.000Z',0,1,1,0,NULL,'y74c07QXIkssDeblYsOSY',NULL,1);
INSERT INTO "sessions" VALUES('cjqklgIIf4O19zBqQwmy5','Lunch Break','','2026-12-12T11:30:00.000Z','2026-12-12T13:00:00.000Z',0,1,1,0,NULL,'y74c07QXIkssDeblYsOSY',NULL,1);
INSERT INTO "sessions" VALUES('ci8dbP__5lb-1v9XB37OH','Opening Keynote - Web Unconference','Welcome to Web Unconference','2026-12-06T08:00:00.000Z','2026-12-06T09:30:00.000Z',100,1,0,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('MwfTCqpgG_h52VwvJ8QME','Lunch Break','','2026-12-06T11:30:00.000Z','2026-12-06T13:00:00.000Z',0,1,1,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('3oFdj6LiKnLUjCRYkCpym','Lunch Break','','2026-12-07T11:30:00.000Z','2026-12-07T13:00:00.000Z',0,1,1,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('sHTA18ot2fJNgF__J2O0W','Lunch Break','','2026-12-08T11:30:00.000Z','2026-12-08T13:00:00.000Z',0,1,1,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('elIqLxVtXYjoAR0h4JwC8','The Future of AI: Transforming Industries Through Machine Learning','Artificial Intelligence is reshaping every industry from healthcare to finance. In this comprehensive session, we''ll explore the current state of AI technology, emerging trends, and practical applications that are driving innovation.

## What you''ll learn

We''ll discuss real-world case studies, ethical considerations, and the skills needed to thrive in an AI-driven world. Whether you''re a beginner or experienced professional, you''ll gain valuable insights into how AI can transform your work and industry.

## Topics

- Natural language processing
- Computer vision
- Predictive analytics
- The intersection of AI with blockchain and IoT','2026-12-06T10:10:00.000Z','2026-12-06T11:00:00.000Z',100,0,0,0,'No5bawBF0YyvML7baPlXm','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('xQoXeTuPjMaLqtOWx41kB','Workshop: Hands-on Docker and Kubernetes','A practical workshop on containerization and orchestration. **Bring your laptop** and get ready to deploy!

Prerequisites:

- Docker installed and working (`docker run hello-world`)
- A free container registry account
- Basic command-line comfort','2026-12-06T10:10:00.000Z','2026-12-06T11:30:00.000Z',30,0,0,1,'AGBEY_njyBy5Q7jRGUZYp','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('MldbEEkJp5vkgrv4yi_f7','Design Systems: Creating Consistency at Scale','Learn how to build and maintain design systems that scale across teams and products.','2026-12-06T13:10:00.000Z','2026-12-06T14:00:00.000Z',100,0,0,0,'1vmXq_aklEGRWiKfVvg_O','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('vBN4l6q78Ox-AZimbH8q1','Open Source Sustainability: Funding and Community Building','The open source ecosystem faces sustainability challenges as projects grow in complexity and importance. This session examines successful funding models, from corporate sponsorship to foundation grants to innovative approaches like [GitHub Sponsors](https://github.com/sponsors).

We''ll discuss community building strategies, *maintainer burnout prevention*, and the economic realities of supporting critical infrastructure projects. Case studies will include successful projects that have achieved sustainable funding and community growth.','2026-12-06T13:10:00.000Z','2026-12-06T14:30:00.000Z',25,0,0,0,'4CL_x9jUBerrTq2nZic1y','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('Z6OpYvFZ3ZwHV4BugTsTG','API Design: RESTful vs GraphQL vs gRPC','A comparative analysis of different API paradigms with practical examples and use cases.','2026-12-06T14:40:00.000Z','2026-12-06T15:30:00.000Z',30,0,0,0,'kIoZ2VvKhffSCGzA-UzVa','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('V4fmvS7jwWLo-IuX5YCbC','Building Scalable Web Applications with Modern React','Dive deep into the latest React patterns and best practices for building scalable applications. We''ll cover state management, performance optimization, and modern tooling.','2026-12-07T08:10:00.000Z','2026-12-07T09:00:00.000Z',100,0,0,0,'TjgBSLfg16pMPiHRyE9Ex','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('yo2ZXKdSg-4um_FxCGd31','The Psychology of User Experience: Understanding Human-Computer Interaction','User experience design is fundamentally about understanding human psychology and behavior. This session delves into cognitive psychology principles that drive effective UX design, including mental models, cognitive load theory, and decision-making processes.

We''ll explore how users actually interact with digital interfaces, common usability heuristics, and the science behind user research methods. Through interactive exercises and real-world examples, attendees will learn to apply psychological principles to create more intuitive and engaging user experiences.

Topics include attention and perception, memory limitations, emotional design, accessibility considerations, and cross-cultural UX patterns. Perfect for designers, developers, and product managers looking to create more human-centered digital products.','2026-12-07T09:10:00.000Z','2026-12-07T10:30:00.000Z',25,0,0,0,'COVa7UWYU5frFHrOdbm3D','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('eLf6ID4htstX9cjowYof6','Performance Optimization: Making Your Apps Lightning Fast','Techniques for optimizing web and mobile applications for speed and efficiency.','2026-12-07T09:40:00.000Z','2026-12-07T11:00:00.000Z',30,0,0,0,'vz9gIngxrD20xdhub4aTA','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('N8q9N2O7e36NuFNsZrr6Q','Machine Learning Ethics: Bias, Fairness, and Accountability','As machine learning systems become more prevalent in decision-making processes, ethical considerations become paramount. This session explores algorithmic bias, fairness metrics, and accountability frameworks.

We''ll examine real-world cases where ML systems have perpetuated or amplified societal biases, and discuss practical approaches for building more equitable AI systems. Topics include data bias, model interpretability, fairness-aware machine learning, and the legal and regulatory landscape surrounding AI ethics.','2026-12-07T13:10:00.000Z','2026-12-07T14:00:00.000Z',100,0,0,0,'eVa4GhsKkugwUOCZ5zXF0','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('lgOe1linCu89H6OwE_pGu','Sustainable Software Development: Green Coding Practices','How to reduce the environmental impact of your code through efficient algorithms and sustainable practices.','2026-12-07T13:10:00.000Z','2026-12-07T14:00:00.000Z',25,0,0,0,'EXrWawC1luKRlZx5ikFrv','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('mURCFTQRoGVOcIbG7DgeL','Building Inclusive Tech Teams: Beyond Diversity Hiring','Creating truly inclusive environments requires more than diverse hiring. This session explores psychological safety, inclusive leadership, and systemic changes needed for equity in tech.

We''ll examine unconscious bias in technical interviews, the importance of sponsorship vs mentorship, and how to build cultures where everyone can thrive. Participants will leave with concrete strategies for fostering inclusion at every level of their organization.','2026-12-07T15:10:00.000Z','2026-12-07T16:00:00.000Z',100,0,0,0,'Dbxx2Q_p7kPeOvtqJpxsY','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('GY5f2ud-7Kjyi03P9Ow9s','Hallway Track: CRDT Show & Tell','Impromptu session: I''ll demo a small real-time collaborative editor built on [CRDTs](https://crdt.tech) and we can poke at the edge cases together. Bring your laptop if you want to pair on it.

Added straight to the schedule because the hallway conversation got out of hand — *that''s what open scheduling is for!*','2026-12-07T15:10:00.000Z','2026-12-07T15:30:00.000Z',15,0,0,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('c5S2812xWzDKwJVAXdV1O','Evening Wrap-up','Loose ends and goodbyes before dinner.','2026-12-07T16:40:00.000Z','2026-12-07T17:00:00.000Z',100,0,0,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('L48v8XqEAW88kwDHKtV6t','Microservices Architecture: Lessons from the Trenches','Real-world experiences with microservices: what works, what doesn''t, and when to avoid them entirely.','2026-12-08T08:10:00.000Z','2026-12-08T09:00:00.000Z',100,0,0,0,'ZKjvcX-vIAtHw2WhDDmxH','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('o8RBJhhqnIprq0SPJ9zd3','Blockchain Beyond Cryptocurrency: Practical Applications','Exploring real-world blockchain applications in supply chain, healthcare, and digital identity.','2026-12-08T09:10:00.000Z','2026-12-08T10:00:00.000Z',30,0,0,0,'7_a3qxw4M5vOCynSHpF7M','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('9p2Sdkum1k8-euhYqw0Um','DevOps Culture: Breaking Down Silos','How to foster collaboration between development and operations teams for better software delivery.','2026-12-08T09:40:00.000Z','2026-12-08T10:30:00.000Z',25,0,0,0,'ZuzR7zm-8hRB2t-BzRS26','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('zU9Y4idODTfMl1uS7T71Z','Cybersecurity in the Age of Remote Work: Protecting Your Digital Assets','The shift to remote work has fundamentally changed the cybersecurity landscape. Traditional perimeter-based security models are no longer sufficient when employees access company resources from home networks, coffee shops, and co-working spaces.

## Session outline

This session will provide a comprehensive overview of modern cybersecurity challenges and solutions. We''ll explore **zero-trust architecture**, endpoint protection strategies, and the human element of cybersecurity. Attendees will learn practical techniques for:

- Securing remote work environments
- Implementing multi-factor authentication
- Creating security awareness programs

We''ll also discuss emerging threats like sophisticated phishing attacks, ransomware targeting remote workers, and supply chain vulnerabilities. Real-world examples and case studies will illustrate both successful security implementations and costly breaches, providing actionable insights for organizations of all sizes.','2026-12-08T13:10:00.000Z','2026-12-08T14:00:00.000Z',100,0,0,0,'DiwkZNYszoJ4Y8u2zULZX','PPGDvamTBn3-mmtGaFpIs',NULL,1);
INSERT INTO "sessions" VALUES('nb6G9EYUZl_6Oc4b4e2yJ','Closing Session & Farewell','Wrap-up of Web Unconference:

- Community announcements
- A look back at the highlights of the last three days
- Thank-yous to volunteers and speakers
- A preview of next year''s edition

We close with a group photo in front of the **Main Hall**.','2026-12-08T15:10:00.000Z','2026-12-08T16:00:00.000Z',100,1,0,0,NULL,'PPGDvamTBn3-mmtGaFpIs',NULL,1);
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Example Conference Weekend' NOT NULL,
	`description` text DEFAULT 'Welcome! Browse the schedules for each event below.' NOT NULL,
	`map_image_url` text DEFAULT '' NOT NULL
);
INSERT INTO "site_settings" VALUES('singleton','Dev Week','One week, one venue, three events: Web Unconference, Open Source Summit and Hackathon. Pick an event to see its proposals and schedule.','');
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
INSERT INTO "comments" VALUES('JOI6jZfonZHKCU6pBTcbf',NULL,NULL,'',1,'2026-11-22T08:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('58UrPAQhcAPTxP115zahN','ShyRUs0k0zkJSJeStRiP7','JOI6jZfonZHKCU6pBTcbf','Good question — no background needed, I''ll start from scratch.',0,'2026-11-22T09:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('fb1XN-9L9unuZfQfiXaL_','9jPdUf_E56CxZut0Qn_cz','58UrPAQhcAPTxP115zahN','Perfect, count me in.',0,'2026-11-22T10:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('DVE5b9jwLqXWNUH7pw7n_','B861fQQuYzBhd-Mocc33H',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-22T11:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('oZLLMxxCSiWPhu4bEY16n','B861fQQuYzBhd-Mocc33H',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-22T09:07:10.035Z',NULL);
INSERT INTO "comments" VALUES('xDNJTnV60-ANnvXNpXNQW','ZDk7oXJvG4aIJGinraw1-',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-22T12:07:10.035Z',NULL);
INSERT INTO "comments" VALUES('2DUvawLVeBKptJjj4lDrX','EHsKrkDZ1krZzBzmwozA4',NULL,'Could this be scheduled later in the day? It clashes with the workshop block.',0,'2026-11-22T09:21:10.035Z',NULL);
INSERT INTO "comments" VALUES('syn8GfvPGjjnPmUOnkodL','NeVPC4sOIpHAFioNYmgzv','2DUvawLVeBKptJjj4lDrX','Good question — no background needed, I''ll start from scratch.',0,'2026-11-22T10:21:10.035Z',NULL);
INSERT INTO "comments" VALUES('RGjG_ms8nNbGe-v3O50iZ','EHsKrkDZ1krZzBzmwozA4',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-22T09:35:10.035Z',NULL);
INSERT INTO "comments" VALUES('Md0VQs5WcfOc-1TeJkjKt','ShyRUs0k0zkJSJeStRiP7',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-22T08:53:10.035Z','2026-11-22T08:57:10.035Z');
INSERT INTO "comments" VALUES('V3tJvKXzl5PdE0_fdMrls','jDbaErpGlXD2gxXe7IhtZ','Md0VQs5WcfOc-1TeJkjKt','Good question — no background needed, I''ll start from scratch.',0,'2026-11-22T09:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('GE3ejUo0X8bMNOJVr-gWH','9jPdUf_E56CxZut0Qn_cz','V3tJvKXzl5PdE0_fdMrls','Perfect, count me in.',0,'2026-11-22T10:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('9HnAWs5r9pcSlbcmFFDY_','B861fQQuYzBhd-Mocc33H',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-22T11:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('R-uCtjmJf4kPeGN_ircza','9jPdUf_E56CxZut0Qn_cz',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-22T09:07:10.035Z',NULL);
INSERT INTO "comments" VALUES('_pRkJrQU7jUE8zkQcxaJn','XHeT_4Wow9aEWWJG576Kh',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-22T09:42:10.035Z',NULL);
INSERT INTO "comments" VALUES('mHXG-gMRnWmeoJgB7ivYz','ID7ZhNxS1jNfhPMDxVxJL','_pRkJrQU7jUE8zkQcxaJn','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-22T10:42:10.035Z',NULL);
INSERT INTO "comments" VALUES('0D39FSV4SLSI74nE2J0yq','6tQX6-ck20zvyo1Q78kcr','mHXG-gMRnWmeoJgB7ivYz','That makes sense, thanks for explaining!',0,'2026-11-22T11:42:10.035Z',NULL);
INSERT INTO "comments" VALUES('cALEC2CII-QGVqHD6yD88','jDbaErpGlXD2gxXe7IhtZ',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-22T09:00:10.035Z',NULL);
INSERT INTO "comments" VALUES('HauHVhk-KJ3jqwsJjKo37','B861fQQuYzBhd-Mocc33H','cALEC2CII-QGVqHD6yD88','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-22T10:00:10.035Z',NULL);
INSERT INTO "comments" VALUES('LwRmRBzQwBKNchSoJNEfh','ZDk7oXJvG4aIJGinraw1-',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-22T09:28:10.035Z','2026-11-22T09:32:10.035Z');
INSERT INTO "comments" VALUES('A0qn7ip3vj6enXJtRL_nQ','qiyX-HGyolJOsfDOFmuLQ','LwRmRBzQwBKNchSoJNEfh','Yes please, drop me a message and we''ll plan it together.',0,'2026-11-22T10:28:10.035Z',NULL);
INSERT INTO "comments" VALUES('rlUQ8cn6lO8nbCba-WqS7','EHsKrkDZ1krZzBzmwozA4','A0qn7ip3vj6enXJtRL_nQ','That makes sense, thanks for explaining!',0,'2026-11-22T11:28:10.035Z',NULL);
INSERT INTO "comments" VALUES('Ayvs-SutSNmQFcCKiHeGx','EHsKrkDZ1krZzBzmwozA4',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-22T09:35:10.035Z',NULL);
INSERT INTO "comments" VALUES('g7OpEmNRblx3KNWf5pozK','u4sh60Jtyei1yRqfuvWhq','Ayvs-SutSNmQFcCKiHeGx','I''d rather keep them separate, they go in quite different directions.',0,'2026-11-22T10:35:10.035Z',NULL);
INSERT INTO "comments" VALUES('dYgy2DfirCse6x0oqvsgw','XHeT_4Wow9aEWWJG576Kh','g7OpEmNRblx3KNWf5pozK','Perfect, count me in.',0,'2026-11-22T11:35:10.035Z',NULL);
INSERT INTO "comments" VALUES('voG4WwX05HTyURVQslJB0','ID7ZhNxS1jNfhPMDxVxJL',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-22T12:35:10.035Z',NULL);
INSERT INTO "comments" VALUES('U_wmzNRbj8143AmDgkULy','ID7ZhNxS1jNfhPMDxVxJL',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-22T09:49:10.035Z',NULL);
INSERT INTO "comments" VALUES('eCgJpTOgCS-zhltYksJkY','pM17gpIj2Josz5tiFZ1el',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-22T10:03:10.035Z','2026-11-22T10:07:10.035Z');
INSERT INTO "comments" VALUES('44dG4WPF40DQ78H5rjYR4','pM17gpIj2Josz5tiFZ1el',NULL,'Would you be open to **co-hosting**? I''ve run something similar before.',0,'2026-11-22T10:10:10.035Z',NULL);
INSERT INTO "comments" VALUES('jY6Bg0roLksRvDV-rc6Ra','XC1WD3CPb71Kuu-q4FQEk',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-22T10:17:10.035Z',NULL);
INSERT INTO "comments" VALUES('CC-oY4TPsBxMG2bvZwtHV','GmxREzYZDWHhdE3YJBkly','jY6Bg0roLksRvDV-rc6Ra','Good question — no background needed, I''ll start from scratch.',0,'2026-11-22T11:17:10.035Z',NULL);
INSERT INTO "comments" VALUES('7wNPKFYk0C1Vx2mF58UyE','ZgqjVdi01mWWPTcE6HcFp','CC-oY4TPsBxMG2bvZwtHV','Perfect, count me in.',0,'2026-11-22T12:17:10.035Z',NULL);
INSERT INTO "comments" VALUES('V4OEt3K9Gl5utOa928z74','oYpHhelks-_fMgSi8Ynqv',NULL,'Really keen on this one — I''ve wanted to talk about it for ages.',0,'2026-11-22T10:38:10.035Z','2026-11-22T10:42:10.035Z');
INSERT INTO "comments" VALUES('qJ0ZzIZkIk3e04PLvXeWR','hIsmJgBfZiWowD4PxpfKb','V4OEt3K9Gl5utOa928z74','Later works for me. I''ll flag it when scheduling opens.',0,'2026-11-22T11:38:10.035Z',NULL);
INSERT INTO "comments" VALUES('K2IYzpUBnRknOA-oTYBJW','p_M18sKsYk7UORNvRFhR1',NULL,'Seconding the above — this is the session I''d most like to attend.',0,'2026-11-22T13:38:10.035Z',NULL);
INSERT INTO "comments" VALUES('1zp3N0cKKIkKmQIoY07Z_','p_M18sKsYk7UORNvRFhR1',NULL,'How much background knowledge are you assuming? Asking for a friend who is me.',0,'2026-11-22T10:52:10.035Z',NULL);
INSERT INTO "comments" VALUES('sNqq5TvcJ6ymfUQc0vKX_','6Ytgf3DnS_Km7Pa5yoXDa',NULL,'This overlaps a bit with the other proposal on the same topic — worth merging?',0,'2026-11-22T10:59:10.035Z',NULL);
INSERT INTO "comments" VALUES('oati6WPLEdNsx_BO9aM-Z','B861fQQuYzBhd-Mocc33H',NULL,'Who else is on the panel?',0,'2026-11-22T13:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('OK3bLkjxmVsrbCfpR82jn','NeVPC4sOIpHAFioNYmgzv','oati6WPLEdNsx_BO9aM-Z','I''d like to join.',0,'2026-11-22T14:53:10.035Z',NULL);
INSERT INTO "comments" VALUES('IUaQySbezv1UqXowh3c8S','ZDk7oXJvG4aIJGinraw1-','oati6WPLEdNsx_BO9aM-Z','So would I.',0,'2026-11-22T15:53:10.035Z',NULL);
CREATE TABLE `proposal_comments` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposal_id`) REFERENCES `session_proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "proposal_comments" VALUES('JOI6jZfonZHKCU6pBTcbf','1WxnaHjmzL-MrFXqoga12');
INSERT INTO "proposal_comments" VALUES('58UrPAQhcAPTxP115zahN','1WxnaHjmzL-MrFXqoga12');
INSERT INTO "proposal_comments" VALUES('fb1XN-9L9unuZfQfiXaL_','1WxnaHjmzL-MrFXqoga12');
INSERT INTO "proposal_comments" VALUES('DVE5b9jwLqXWNUH7pw7n_','1WxnaHjmzL-MrFXqoga12');
INSERT INTO "proposal_comments" VALUES('oZLLMxxCSiWPhu4bEY16n','jfVWtciMXay_FusYKq4iy');
INSERT INTO "proposal_comments" VALUES('xDNJTnV60-ANnvXNpXNQW','jfVWtciMXay_FusYKq4iy');
INSERT INTO "proposal_comments" VALUES('2DUvawLVeBKptJjj4lDrX','i_B-1i-hdFFMOe-xrJ70B');
INSERT INTO "proposal_comments" VALUES('syn8GfvPGjjnPmUOnkodL','i_B-1i-hdFFMOe-xrJ70B');
INSERT INTO "proposal_comments" VALUES('RGjG_ms8nNbGe-v3O50iZ','RR-UfrH1lmmw9JvQBpZE9');
INSERT INTO "proposal_comments" VALUES('Md0VQs5WcfOc-1TeJkjKt','WvU5O9bV8-VLx2HHDaA0O');
INSERT INTO "proposal_comments" VALUES('V3tJvKXzl5PdE0_fdMrls','WvU5O9bV8-VLx2HHDaA0O');
INSERT INTO "proposal_comments" VALUES('GE3ejUo0X8bMNOJVr-gWH','WvU5O9bV8-VLx2HHDaA0O');
INSERT INTO "proposal_comments" VALUES('9HnAWs5r9pcSlbcmFFDY_','WvU5O9bV8-VLx2HHDaA0O');
INSERT INTO "proposal_comments" VALUES('R-uCtjmJf4kPeGN_ircza','Hti-rXuCo__RH--HZhXqD');
INSERT INTO "proposal_comments" VALUES('_pRkJrQU7jUE8zkQcxaJn','OZ-D_jct8LPqhsOt3kS3a');
INSERT INTO "proposal_comments" VALUES('mHXG-gMRnWmeoJgB7ivYz','OZ-D_jct8LPqhsOt3kS3a');
INSERT INTO "proposal_comments" VALUES('0D39FSV4SLSI74nE2J0yq','OZ-D_jct8LPqhsOt3kS3a');
INSERT INTO "proposal_comments" VALUES('cALEC2CII-QGVqHD6yD88','No5bawBF0YyvML7baPlXm');
INSERT INTO "proposal_comments" VALUES('HauHVhk-KJ3jqwsJjKo37','No5bawBF0YyvML7baPlXm');
INSERT INTO "proposal_comments" VALUES('LwRmRBzQwBKNchSoJNEfh','ZKjvcX-vIAtHw2WhDDmxH');
INSERT INTO "proposal_comments" VALUES('A0qn7ip3vj6enXJtRL_nQ','ZKjvcX-vIAtHw2WhDDmxH');
INSERT INTO "proposal_comments" VALUES('rlUQ8cn6lO8nbCba-WqS7','ZKjvcX-vIAtHw2WhDDmxH');
INSERT INTO "proposal_comments" VALUES('Ayvs-SutSNmQFcCKiHeGx','EXrWawC1luKRlZx5ikFrv');
INSERT INTO "proposal_comments" VALUES('g7OpEmNRblx3KNWf5pozK','EXrWawC1luKRlZx5ikFrv');
INSERT INTO "proposal_comments" VALUES('dYgy2DfirCse6x0oqvsgw','EXrWawC1luKRlZx5ikFrv');
INSERT INTO "proposal_comments" VALUES('voG4WwX05HTyURVQslJB0','EXrWawC1luKRlZx5ikFrv');
INSERT INTO "proposal_comments" VALUES('U_wmzNRbj8143AmDgkULy','kIoZ2VvKhffSCGzA-UzVa');
INSERT INTO "proposal_comments" VALUES('eCgJpTOgCS-zhltYksJkY','7_a3qxw4M5vOCynSHpF7M');
INSERT INTO "proposal_comments" VALUES('44dG4WPF40DQ78H5rjYR4','vz9gIngxrD20xdhub4aTA');
INSERT INTO "proposal_comments" VALUES('jY6Bg0roLksRvDV-rc6Ra','4CL_x9jUBerrTq2nZic1y');
INSERT INTO "proposal_comments" VALUES('CC-oY4TPsBxMG2bvZwtHV','4CL_x9jUBerrTq2nZic1y');
INSERT INTO "proposal_comments" VALUES('7wNPKFYk0C1Vx2mF58UyE','4CL_x9jUBerrTq2nZic1y');
INSERT INTO "proposal_comments" VALUES('V4OEt3K9Gl5utOa928z74','3Fah_E9gWz_GfkuanoTRj');
INSERT INTO "proposal_comments" VALUES('qJ0ZzIZkIk3e04PLvXeWR','3Fah_E9gWz_GfkuanoTRj');
INSERT INTO "proposal_comments" VALUES('K2IYzpUBnRknOA-oTYBJW','3Fah_E9gWz_GfkuanoTRj');
INSERT INTO "proposal_comments" VALUES('1zp3N0cKKIkKmQIoY07Z_','uRQ9-NLdODTV2O-9ZbqeM');
INSERT INTO "proposal_comments" VALUES('sNqq5TvcJ6ymfUQc0vKX_','717l-rDjvWjoRF9dARR5b');
INSERT INTO "proposal_comments" VALUES('oati6WPLEdNsx_BO9aM-Z','dqzoRjwwtXYo6Q_by8trQ');
INSERT INTO "proposal_comments" VALUES('OK3bLkjxmVsrbCfpR82jn','dqzoRjwwtXYo6Q_by8trQ');
INSERT INTO "proposal_comments" VALUES('IUaQySbezv1UqXowh3c8S','dqzoRjwwtXYo6Q_by8trQ');
CREATE TABLE `comment_likes` (
	`comment_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`created_time` text NOT NULL,
	PRIMARY KEY(`comment_id`, `guest_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "comment_likes" VALUES('58UrPAQhcAPTxP115zahN','9jPdUf_E56CxZut0Qn_cz','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('fb1XN-9L9unuZfQfiXaL_','B861fQQuYzBhd-Mocc33H','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('fb1XN-9L9unuZfQfiXaL_','NeVPC4sOIpHAFioNYmgzv','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('fb1XN-9L9unuZfQfiXaL_','ZDk7oXJvG4aIJGinraw1-','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('DVE5b9jwLqXWNUH7pw7n_','NeVPC4sOIpHAFioNYmgzv','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('DVE5b9jwLqXWNUH7pw7n_','ZDk7oXJvG4aIJGinraw1-','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('oZLLMxxCSiWPhu4bEY16n','ZDk7oXJvG4aIJGinraw1-','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('oZLLMxxCSiWPhu4bEY16n','EHsKrkDZ1krZzBzmwozA4','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('xDNJTnV60-ANnvXNpXNQW','EHsKrkDZ1krZzBzmwozA4','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('xDNJTnV60-ANnvXNpXNQW','XHeT_4Wow9aEWWJG576Kh','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('xDNJTnV60-ANnvXNpXNQW','ID7ZhNxS1jNfhPMDxVxJL','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('2DUvawLVeBKptJjj4lDrX','XHeT_4Wow9aEWWJG576Kh','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('syn8GfvPGjjnPmUOnkodL','ID7ZhNxS1jNfhPMDxVxJL','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('RGjG_ms8nNbGe-v3O50iZ','q4O1MRMpeQlO0TyrxQd_R','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('RGjG_ms8nNbGe-v3O50iZ','6tQX6-ck20zvyo1Q78kcr','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('Md0VQs5WcfOc-1TeJkjKt','6tQX6-ck20zvyo1Q78kcr','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('GE3ejUo0X8bMNOJVr-gWH','XC1WD3CPb71Kuu-q4FQEk','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('GE3ejUo0X8bMNOJVr-gWH','ZgqjVdi01mWWPTcE6HcFp','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('GE3ejUo0X8bMNOJVr-gWH','T3SJUd7xO-unLThU9aPx5','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('9HnAWs5r9pcSlbcmFFDY_','ZgqjVdi01mWWPTcE6HcFp','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('9HnAWs5r9pcSlbcmFFDY_','T3SJUd7xO-unLThU9aPx5','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('R-uCtjmJf4kPeGN_ircza','T3SJUd7xO-unLThU9aPx5','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('R-uCtjmJf4kPeGN_ircza','oYpHhelks-_fMgSi8Ynqv','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('R-uCtjmJf4kPeGN_ircza','z1l8a7TPL4zOpBWrrc70v','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('_pRkJrQU7jUE8zkQcxaJn','oYpHhelks-_fMgSi8Ynqv','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('_pRkJrQU7jUE8zkQcxaJn','z1l8a7TPL4zOpBWrrc70v','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('0D39FSV4SLSI74nE2J0yq','p_M18sKsYk7UORNvRFhR1','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('cALEC2CII-QGVqHD6yD88','6Ytgf3DnS_Km7Pa5yoXDa','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('cALEC2CII-QGVqHD6yD88','qiyX-HGyolJOsfDOFmuLQ','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('cALEC2CII-QGVqHD6yD88','RH72K1YnCL9U6GaoBIZ3A','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('HauHVhk-KJ3jqwsJjKo37','qiyX-HGyolJOsfDOFmuLQ','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('LwRmRBzQwBKNchSoJNEfh','RH72K1YnCL9U6GaoBIZ3A','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('LwRmRBzQwBKNchSoJNEfh','CO4-kIGmWGDbsH-ZNRVfp','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('LwRmRBzQwBKNchSoJNEfh','u4sh60Jtyei1yRqfuvWhq','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('A0qn7ip3vj6enXJtRL_nQ','CO4-kIGmWGDbsH-ZNRVfp','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('A0qn7ip3vj6enXJtRL_nQ','u4sh60Jtyei1yRqfuvWhq','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('rlUQ8cn6lO8nbCba-WqS7','u4sh60Jtyei1yRqfuvWhq','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('Ayvs-SutSNmQFcCKiHeGx','fqiG3ELvXNV3ZXgLKURZ7','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('g7OpEmNRblx3KNWf5pozK','_KDPWE7W8XHyCGdW1Jqz0','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('dYgy2DfirCse6x0oqvsgw','2tq-6-EBPhS296h5jaN3w','2026-11-22T17:53:10.035Z');
INSERT INTO "comment_likes" VALUES('dYgy2DfirCse6x0oqvsgw','4NihDOqv7M8nE5B5bF85j','2026-11-22T17:52:10.035Z');
INSERT INTO "comment_likes" VALUES('dYgy2DfirCse6x0oqvsgw','tas_A2j6mnCwRp25e7zqv','2026-11-22T17:51:10.035Z');
INSERT INTO "comment_likes" VALUES('voG4WwX05HTyURVQslJB0','4NihDOqv7M8nE5B5bF85j','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('voG4WwX05HTyURVQslJB0','tas_A2j6mnCwRp25e7zqv','2026-11-22T17:52:10.036Z');
INSERT INTO "comment_likes" VALUES('U_wmzNRbj8143AmDgkULy','tas_A2j6mnCwRp25e7zqv','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('U_wmzNRbj8143AmDgkULy','653Laslo-7HV4UdR60VwR','2026-11-22T17:52:10.036Z');
INSERT INTO "comment_likes" VALUES('U_wmzNRbj8143AmDgkULy','cO2_Nc0x7m8d-gkVyu-yp','2026-11-22T17:51:10.036Z');
INSERT INTO "comment_likes" VALUES('eCgJpTOgCS-zhltYksJkY','653Laslo-7HV4UdR60VwR','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('V4OEt3K9Gl5utOa928z74','MvNRNQmDDalIVOqCGUwcA','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('qJ0ZzIZkIk3e04PLvXeWR','MvNRNQmDDalIVOqCGUwcA','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('qJ0ZzIZkIk3e04PLvXeWR','GmxREzYZDWHhdE3YJBkly','2026-11-22T17:52:10.036Z');
INSERT INTO "comment_likes" VALUES('K2IYzpUBnRknOA-oTYBJW','GmxREzYZDWHhdE3YJBkly','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('1zp3N0cKKIkKmQIoY07Z_','2LWBMof-CEnu7UbVFhthf','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('oati6WPLEdNsx_BO9aM-Z','zeC7AGyqkuMKpY5WxbckT','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('oati6WPLEdNsx_BO9aM-Z','rJhXeJVBKd4Lll0FKaIWo','2026-11-22T17:52:10.036Z');
INSERT INTO "comment_likes" VALUES('oati6WPLEdNsx_BO9aM-Z','ShyRUs0k0zkJSJeStRiP7','2026-11-22T17:51:10.036Z');
INSERT INTO "comment_likes" VALUES('OK3bLkjxmVsrbCfpR82jn','rJhXeJVBKd4Lll0FKaIWo','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('IUaQySbezv1UqXowh3c8S','ShyRUs0k0zkJSJeStRiP7','2026-11-22T17:53:10.036Z');
INSERT INTO "comment_likes" VALUES('IUaQySbezv1UqXowh3c8S','jDbaErpGlXD2gxXe7IhtZ','2026-11-22T17:52:10.036Z');
INSERT INTO "comment_likes" VALUES('IUaQySbezv1UqXowh3c8S','9jPdUf_E56CxZut0Qn_cz','2026-11-22T17:51:10.036Z');
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
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-13T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-14T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','ShyRUs0k0zkJSJeStRiP7','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','B861fQQuYzBhd-Mocc33H','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','EHsKrkDZ1krZzBzmwozA4','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','q4O1MRMpeQlO0TyrxQd_R','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','XC1WD3CPb71Kuu-q4FQEk','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','oYpHhelks-_fMgSi8Ynqv','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','CO4-kIGmWGDbsH-ZNRVfp','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','_KDPWE7W8XHyCGdW1Jqz0','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','tas_A2j6mnCwRp25e7zqv','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','hFSVi1NdhxC0ZStQE5ZZX','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','MvNRNQmDDalIVOqCGUwcA','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','2LWBMof-CEnu7UbVFhthf','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('tCNQtXjwgJKS47DHOu32C','rJhXeJVBKd4Lll0FKaIWo','2026-12-15T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-10T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-11T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','ShyRUs0k0zkJSJeStRiP7','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','B861fQQuYzBhd-Mocc33H','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','EHsKrkDZ1krZzBzmwozA4','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','q4O1MRMpeQlO0TyrxQd_R','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','XC1WD3CPb71Kuu-q4FQEk','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','oYpHhelks-_fMgSi8Ynqv','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','CO4-kIGmWGDbsH-ZNRVfp','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','_KDPWE7W8XHyCGdW1Jqz0','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','tas_A2j6mnCwRp25e7zqv','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','hFSVi1NdhxC0ZStQE5ZZX','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','MvNRNQmDDalIVOqCGUwcA','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','2LWBMof-CEnu7UbVFhthf','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('y74c07QXIkssDeblYsOSY','rJhXeJVBKd4Lll0FKaIWo','2026-12-12T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-06T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-07T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T13:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T13:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T14:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T14:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T15:00:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','ShyRUs0k0zkJSJeStRiP7','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','B861fQQuYzBhd-Mocc33H','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','EHsKrkDZ1krZzBzmwozA4','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','q4O1MRMpeQlO0TyrxQd_R','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','XC1WD3CPb71Kuu-q4FQEk','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','oYpHhelks-_fMgSi8Ynqv','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','6Ytgf3DnS_Km7Pa5yoXDa','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','CO4-kIGmWGDbsH-ZNRVfp','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','_KDPWE7W8XHyCGdW1Jqz0','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','MvNRNQmDDalIVOqCGUwcA','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','2LWBMof-CEnu7UbVFhthf','2026-12-08T15:30:00.000Z');
INSERT INTO "meeting_availability" VALUES('PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','2026-12-08T15:30:00.000Z');
CREATE TABLE `meeting_points` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_index` integer DEFAULT 0 NOT NULL, `version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "meeting_points" VALUES('p0FhHA4qYn2t63ZvTOKQz','tCNQtXjwgJKS47DHOu32C','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('JxQ8ZsaZ0uuxp7z_oG2x7','tCNQtXjwgJKS47DHOu32C','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('g_nN0hZWtjhXfFygK2MgR','y74c07QXIkssDeblYsOSY','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('7H0bNRp61BoWVaAcyl-5C','y74c07QXIkssDeblYsOSY','Garden bench','Behind the kitchen, weather permitting.',1,1);
INSERT INTO "meeting_points" VALUES('cu-5CQsp9TlSEAJ7Y-Chu','PPGDvamTBn3-mmtGaFpIs','Coffee bar','By the main staircase, open all day.',0,1);
INSERT INTO "meeting_points" VALUES('BpGBzD_95HkvjtF3qKI8Y','PPGDvamTBn3-mmtGaFpIs','Garden bench','Behind the kitchen, weather permitting.',1,1);
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
INSERT INTO "meetings" VALUES('_eyzhJt7gW_SNr_TCRFYZ','PPGDvamTBn3-mmtGaFpIs','rJhXeJVBKd4Lll0FKaIWo','Ljq2361xA-6AtdyIXl1D0','2026-12-06T09:00:00.000Z','2026-12-06T09:30:00.000Z','Coffee bar','Container queries, and where they still bite.','accepted','2026-11-22T18:53:10.570Z','2026-11-22T18:53:10.570Z','');
INSERT INTO "meetings" VALUES('wjOCFwW3q_OnCmK9jJ3gC','PPGDvamTBn3-mmtGaFpIs','tas_A2j6mnCwRp25e7zqv','Ljq2361xA-6AtdyIXl1D0','2026-12-06T09:00:00.000Z','2026-12-06T09:30:00.000Z','Garden bench','Could I steal you for the same half hour?','pending','2026-11-22T18:53:10.570Z',NULL,'');
INSERT INTO "meetings" VALUES('yX3Fx6Tj7YT40b-9MzbXM','PPGDvamTBn3-mmtGaFpIs','cO2_Nc0x7m8d-gkVyu-yp','Ljq2361xA-6AtdyIXl1D0','2026-12-06T10:00:00.000Z','2026-12-06T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-22T18:53:10.570Z',NULL,'');
INSERT INTO "meetings" VALUES('K1EYZJbGhmfYa_mzSoMQO','PPGDvamTBn3-mmtGaFpIs','hFSVi1NdhxC0ZStQE5ZZX','Ljq2361xA-6AtdyIXl1D0','2026-12-06T10:00:00.000Z','2026-12-06T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-22T18:53:10.570Z',NULL,'');
INSERT INTO "meetings" VALUES('4xRnvga535KyN1JXyOY0j','PPGDvamTBn3-mmtGaFpIs','b_LuQUObIIxcv_Mlg7gvo','Ljq2361xA-6AtdyIXl1D0','2026-12-06T10:00:00.000Z','2026-12-06T10:30:00.000Z','Coffee bar','Free at eleven?','pending','2026-11-22T18:53:10.570Z',NULL,'');
INSERT INTO "meetings" VALUES('m5TMZte7YS0Ak9WRGqUAo','PPGDvamTBn3-mmtGaFpIs','Ljq2361xA-6AtdyIXl1D0','MvNRNQmDDalIVOqCGUwcA','2026-12-06T14:30:00.000Z','2026-12-06T15:00:00.000Z','Garden bench','Keen to hear how you run your platform team.','accepted','2026-11-22T18:53:10.570Z','2026-11-22T18:53:10.570Z','');
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text NOT NULL,
	`read_at` text, `message` text,
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
, `locale` text);
INSERT INTO "guests" VALUES('ShyRUs0k0zkJSJeStRiP7','Alice Test','alice@test.com','Frontend developer from Osaka. I love talking about **accessibility** and design systems — find me at the coffee machine.','She/Her','Osaka, Japan','[{"prompt":"Ask me about","answer":"Accessible design patterns and Japanese web typography"},{"prompt":"Offering","answer":"Code review swaps and coffee-machine debugging sessions"}]','["Japanese","English"]','[{"type":"website","value":"https://alice-test.example.com"},{"type":"telegram","value":"@alice_frontend"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/ShyRUs0k0zkJSJeStRiP7.webp?v=1795373588760','2026-11-22T15:53:08.760Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('jDbaErpGlXD2gxXe7IhtZ','Bob Test','bob@test.com','Product manager and community organizer from Lagos. I run a local meetup on inclusive product design and I''m always looking for speakers.','He/Him','Lagos, Nigeria','[{"prompt":"Looking for","answer":"Speakers for an inclusive product design meetup back home"},{"prompt":"Offering","answer":"Feedback on your product roadmap over coffee"}]','["English","Yoruba"]','[{"type":"email","value":"bob.organizes@example.com"},{"type":"whatsapp","value":"+234 801 234 5678"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/jDbaErpGlXD2gxXe7IhtZ.webp?v=1795373588763','2026-11-21T20:53:08.763Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('9jPdUf_E56CxZut0Qn_cz','Charlie Test','charlie@test.com','Data engineer from Guadalajara. Ask me about stream processing, or better yet, about my sourdough starter.','They/Them','Guadalajara, Mexico','[{"prompt":"Ask me about","answer":"Stream processing pipelines, or my sourdough starter"},{"prompt":"My weirdest skill","answer":"Naming Kafka topics that still make sense a year later"}]','["Spanish","English"]','[{"type":"discord","value":"charlie.streams"},{"type":"website","value":"https://charlie.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/9jPdUf_E56CxZut0Qn_cz.webp?v=1795373588763','2026-11-21T01:53:08.763Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('B861fQQuYzBhd-Mocc33H','Yuki Tanaka','yuki.tanaka@example.com',NULL,'He/Him',NULL,'[{"prompt":"Ask me about","answer":"Retro handheld consoles"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-20T06:53:08.763Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('NeVPC4sOIpHAFioNYmgzv','Amara Okafor','amara.okafor@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('ZDk7oXJvG4aIJGinraw1-','Sofía Martínez','sofia.martinez@example.com',NULL,'She/Her',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-18T16:53:08.846Z',1,'scrypt$WyvQcfZtfL/DnCR1jAs8Qw==$EYseEI0aepiBmFCBsacRTOz/1EGIlT0xj5e4YCtVCMs=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('EHsKrkDZ1krZzBzmwozA4','Wei Chen','wei.chen@example.com','Platform engineer focused on developer experience.

Previously built CI tooling at a fintech startup in Shanghai. Ask me about `pipeline caching`.',NULL,'Shanghai, China','[{"prompt":"Ask me about","answer":"Build caching strategies that hold up under real CI load"}]','["Mandarin Chinese","English"]','[{"type":"telegram","value":"@weichen_dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/EHsKrkDZ1krZzBzmwozA4.webp?v=1795373588764','2026-11-17T21:53:08.817Z',1,'scrypt$Isg+Aa9emdovjNN3/i2lYg==$mrclMm2Gu/hjLnxeVwy5cs/ZSRVMh6tazbUI6rRqNvc=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('XHeT_4Wow9aEWWJG576Kh','Priya Sharma','priya.sharma@example.com','ML researcher from Bengaluru working on **fairness in recommendation systems**.

*First time at this conference* — say hi if you see me wandering around looking lost!','She/Her','Bengaluru, India','[{"prompt":"Ask me about","answer":"Fairness metrics for recommender systems"},{"prompt":"Looking for","answer":"A conference buddy — this is my first time here!"}]','["Hindi","Kannada","English"]','[{"type":"website","value":"https://priyasharma.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/XHeT_4Wow9aEWWJG576Kh.webp?v=1795373588764','2026-11-17T02:53:08.764Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('ID7ZhNxS1jNfhPMDxVxJL','Lars Eriksson','lars.eriksson@example.com','Backend developer from Gothenburg. In rough order of enthusiasm:

- Rust
- saunas
- Kubernetes (reluctantly)','He/Him','Gothenburg, Sweden','[{"prompt":"Offering","answer":"Strong opinions about Rust, mild opinions about saunas"}]','["Swedish","English"]','[{"type":"signal","value":"lars.eriksson.99"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/ID7ZhNxS1jNfhPMDxVxJL.webp?v=1795373588764','2026-11-16T07:53:08.861Z',1,'scrypt$ck6XPva+PcqWtau/Xj7V2g==$SYHaeeiwT/HvPMh6wwWK3on3S0MIlP77Woam7C4Bgqs=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('q4O1MRMpeQlO0TyrxQd_R','Fatima Al-Farsi','fatima.alfarsi@example.com','Security engineer from Muscat. I break things *professionally* and fix them as a hobby. Happy to chat about threat modeling for small teams.',NULL,'Muscat, Oman','[{"prompt":"Ask me about","answer":"Threat modeling for teams too small to have a security hire"}]','["Arabic","English"]','[{"type":"email","value":"fatima.breaks.things@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/q4O1MRMpeQlO0TyrxQd_R.webp?v=1795373588765','2026-11-15T12:53:08.837Z',1,'scrypt$Qwz1Vj4iWmTIjuL3fuVBjw==$hkfMZW8IS1qx4tt0YfQSj0ffAyCmHW36Mlb327+R6xc=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('6tQX6-ck20zvyo1Q78kcr','Kwame Mensah','kwame.mensah@example.com','Founder of a small agritech company in Accra. Interested in offline-first apps and building for low-bandwidth environments.','He/Him','Accra, Ghana','[{"prompt":"Offering","answer":"War stories about building for 2G networks"}]','["Twi","English"]','[{"type":"whatsapp","value":"+233 24 555 0187"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/6tQX6-ck20zvyo1Q78kcr.webp?v=1795373588765','2026-11-14T17:53:08.859Z',1,'scrypt$RI/PJCuczptP6lvVmgmQjA==$k7QhPosM667C6simBQbeNL8/q3QiTSBLhTmUahPKaU0=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('pM17gpIj2Josz5tiFZ1el','Hiroshi Yamamoto','hiroshi.yamamoto@example.com','Embedded systems engineer. I make LEDs blink for a living and I''m not ashamed of it.',NULL,'Yokohama, Japan','[{"prompt":"My weirdest skill","answer":"Debugging a blinking LED by ear"}]','["Japanese"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/pM17gpIj2Josz5tiFZ1el.webp?v=1795373588765','2026-11-13T22:53:08.885Z',1,'scrypt$Z6hppqQoPejx/JXzqAgEYA==$U7HlKl1Rlx6oF4NU3cISPILdFNX9sKlxXhD1+LItj1M=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('XC1WD3CPb71Kuu-q4FQEk','Aisha Diallo','aisha.diallo@example.com','UX researcher from Dakar, currently based in Berlin. I care deeply about research ethics and multilingual interfaces.','She/Her','Berlin, Germany','[{"prompt":"Ask me about","answer":"Research ethics for multilingual user studies"}]','["French","Wolof","English","German"]','[{"type":"website","value":"https://aishadiallo.example.com"},{"type":"other","label":"Mastodon","value":"@aisha@ux.social"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/XC1WD3CPb71Kuu-q4FQEk.webp?v=1795373588765','2026-11-13T03:53:08.915Z',1,'scrypt$fsqu9rDPKXpqpgEb5vWVVA==$KuWG/bg7I5PpaeEPq9Ag7kirPYctOZZC1gGAEbsjPL8=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('ZgqjVdi01mWWPTcE6HcFp','Diego Fernández','diego.fernandez@example.com','Site reliability engineer from Buenos Aires. On-call survivor, incident retrospective enthusiast, tango dancer on weekends.',NULL,'Buenos Aires, Argentina','[{"prompt":"Offering","answer":"A rundown of the worst incident I ever caused, for entertainment purposes"}]','["Spanish","English"]','[{"type":"telegram","value":"@diego_sre"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/ZgqjVdi01mWWPTcE6HcFp.webp?v=1795373588765','2026-11-12T08:53:08.903Z',1,'scrypt$5idROGK7hx27fJLsis/JyA==$/BD57/F6HOr8HQKz/sJTATjzW3sYxyZAdPsfTdj7N+A=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('T3SJUd7xO-unLThU9aPx5','Mei-Ling Wu','meiling.wu@example.com','Technical writer from Taipei. I turn engineering mumbling into documentation people actually read.','She/Her','Taipei, Taiwan','[{"prompt":"Ask me about","answer":"Turning a wall of Slack threads into docs people read"}]','["Mandarin Chinese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/T3SJUd7xO-unLThU9aPx5.webp?v=1795373588765','2026-11-11T13:53:08.958Z',1,'scrypt$ulm7TI65RymI8KZR1gfi/Q==$lQQj0G/tC6cuNTD4oMRSUGTKr+Vdjyi69Y6UukSYKNQ=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('oYpHhelks-_fMgSi8Ynqv','Olga Petrova','olga.petrova@example.com','Database internals nerd. If your query is slow I want to hear about it in excruciating detail.',NULL,'Novosibirsk, Russia','[{"prompt":"Offering","answer":"A very detailed opinion about your slow query, whether you want it or not"}]','["Russian","English"]','[{"type":"email","value":"olga.petrova.db@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/oYpHhelks-_fMgSi8Ynqv.webp?v=1795373588765','2026-11-10T18:53:08.929Z',1,'scrypt$D4g3v1nVOXQ4wublRIiqhw==$FHvwBwYMbpQ90ht3bF4LLOJuae0p4lWbPKMvRTpli14=',NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('z1l8a7TPL4zOpBWrrc70v','Jean-Pierre Dubois','jeanpierre.dubois@example.com','Engineering manager from Lyon. Interested in sustainable pace, team topologies, and where to find decent cheese near the venue.','He/Him','Lyon, France','[{"prompt":"Looking for","answer":"Cheese recommendations near the venue"}]','["French","English"]','[{"type":"whatsapp","value":"+33 6 12 34 56 78"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/z1l8a7TPL4zOpBWrrc70v.webp?v=1795373588765','2026-11-09T23:53:08.765Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('p_M18sKsYk7UORNvRFhR1','Thabo Ndlovu','thabo.ndlovu@example.com','Full-stack developer from Johannesburg working in civic tech. Building tools that help people navigate public services.',NULL,'Johannesburg, South Africa','[{"prompt":"Ask me about","answer":"Building civic tech that survives contact with real government data"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/p_M18sKsYk7UORNvRFhR1.webp?v=1795373588765','2026-11-09T04:53:08.765Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('6Ytgf3DnS_Km7Pa5yoXDa','Anna Kowalska','anna.kowalska@example.com','QA engineer from Kraków. I find the bugs you swore were impossible.

Also: board game collector, **200+ and counting**.','She/Her','Kraków, Poland','[{"prompt":"Offering","answer":"Trades: I''ll find your worst bug for a board game recommendation"}]','["Polish","English"]','[{"type":"discord","value":"anna.qa"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/6Ytgf3DnS_Km7Pa5yoXDa.webp?v=1795373588765','2026-11-08T09:53:08.765Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('qiyX-HGyolJOsfDOFmuLQ','Mohammed El-Sayed','mohammed.elsayed@example.com','Cloud architect from Cairo. Recovering microservices maximalist — ask me about the monolith we happily went back to.',NULL,'Cairo, Egypt','[{"prompt":"A hill I will die on","answer":"Boring architecture beats clever architecture, every time"}]','["Arabic","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/qiyX-HGyolJOsfDOFmuLQ.webp?v=1795373588766','2026-11-07T14:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('RH72K1YnCL9U6GaoBIZ3A','Isabella Rossi','isabella.rossi@example.com','Design lead from Milan. I bridge the gap between Figma and production, one design token at a time.','She/Her','Milan, Italy','[{"prompt":"Ask me about","answer":"Getting design tokens to survive contact with production"}]','["English","French"]','[{"type":"website","value":"https://isabellarossi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/RH72K1YnCL9U6GaoBIZ3A.webp?v=1795373588766','2026-11-06T19:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('CO4-kIGmWGDbsH-ZNRVfp','Min-jun Kim','minjun.kim@example.com','Game developer from Seoul, moonlighting in web tech. Fascinated by real-time collaboration and CRDTs.','They/Them','Seoul, South Korea','[{"prompt":"Currently obsessed with","answer":"CRDTs, and why conflict-free replication is harder than it sounds"}]','["Korean","English"]','[{"type":"discord","value":"minjunkim"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/CO4-kIGmWGDbsH-ZNRVfp.webp?v=1795373588766','2026-11-06T00:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('u4sh60Jtyei1yRqfuvWhq','Carlos Silva','carlos.silva@example.com','DevOps engineer from Porto. I automate myself out of a job roughly once a year and somehow still have one.',NULL,'Porto, Portugal','[{"prompt":"Offering","answer":"A talk about automating yourself out of a job, repeatedly"}]','["Portuguese","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/u4sh60Jtyei1yRqfuvWhq.webp?v=1795373588766','2026-11-05T05:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('fqiG3ELvXNV3ZXgLKURZ7','Nadia Haddad','nadia.haddad@example.com','Mobile developer from Beirut. Flutter by day, native by necessity. Organizer of a local women-in-tech mentoring circle.','She/Her','Beirut, Lebanon','[{"prompt":"Looking for","answer":"Mentors and mentees for a women-in-tech circle back home"}]','["Arabic","French","English"]','[{"type":"other","label":"Instagram","value":"@nadia.builds"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-04T10:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('_KDPWE7W8XHyCGdW1Jqz0','Freya Nielsen','freya.nielsen@example.com','Accessibility consultant from Copenhagen. Screen reader power user. I will happily audit your conference talk slides.',NULL,'Copenhagen, Denmark','[{"prompt":"Offering","answer":"A free accessibility pass on your slides — bring your laptop"}]','["Danish","English"]','[{"type":"email","value":"freya.a11y@example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-03T15:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('2tq-6-EBPhS296h5jaN3w','Arjun Nair','arjun.nair@example.com','Distributed systems engineer from Kochi. Currently obsessed with consensus protocols and filter coffee, in that order.','He/Him','Kochi, India','[{"prompt":"Currently obsessed with","answer":"Consensus protocols, and where filter coffee ranks among them"}]','["Malayalam","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-02T20:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('4NihDOqv7M8nE5B5bF85j','Elif Yılmaz','elif.yilmaz@example.com','Computer science student from Istanbul, here on a scholarship ticket. Excited about everything, please recommend me sessions!',NULL,'Istanbul, Turkey','[{"prompt":"Looking for","answer":"Session recommendations — I''m new here and excited about everything"}]','["Turkish","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-02T01:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('tas_A2j6mnCwRp25e7zqv','Samuel Adeyemi','samuel.adeyemi@example.com','Backend engineer from Ibadan working on payment infrastructure across West Africa.',NULL,'Ibadan, Nigeria',NULL,'["Yoruba","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-11-01T06:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('653Laslo-7HV4UdR60VwR','Linh Nguyen','linh.nguyen@example.com','Freelance web developer from Ho Chi Minh City. Jamstack fan, static site generator connoisseur, occasional conference speaker.','They/Them','Ho Chi Minh City, Vietnam','[{"prompt":"Offering","answer":"Static site generator recommendations, unsolicited and opinionated"}]','["Vietnamese","English"]','[{"type":"telegram","value":"@linh_jamstack"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-31T11:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('cO2_Nc0x7m8d-gkVyu-yp','Marta Horvat','marta.horvat@example.com','Agile coach from Zagreb. Yes, we can talk about whether estimates are worth it. No, we won''t agree.',NULL,'Zagreb, Croatia','[{"prompt":"A hill I will die on","answer":"Estimates are a communication tool, not a promise"}]','["Croatian","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-30T16:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('hFSVi1NdhxC0ZStQE5ZZX','Dmitri Volkov','dmitri.volkov@example.com','Compiler engineer. I read language specs for fun and I''m told this is concerning.',NULL,NULL,'[{"prompt":"My weirdest skill","answer":"Reading language specs for fun, apparently"}]',NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-29T21:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('b_LuQUObIIxcv_Mlg7gvo','Chiara Bianchi','chiara.bianchi@example.com','Data scientist from Bologna working in public health. Interested in reproducible research and open data.','She/Her','Bologna, Italy','[{"prompt":"Ask me about","answer":"Making public health research reproducible without a data team"}]',NULL,'[{"type":"website","value":"https://chiarabianchi.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-29T02:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('Ljq2361xA-6AtdyIXl1D0','Zanele Khumalo','zanele.khumalo@example.com','Frontend developer from Durban. CSS is my love language. Currently deep-diving into container queries.',NULL,'Durban, South Africa','[{"prompt":"Offering","answer":"Container query wizardry, upon request"}]','["Zulu","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-28T07:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('MvNRNQmDDalIVOqCGUwcA','Rafael Souza','rafael.souza@example.com','Engineering lead from São Paulo. I care about:

1. Mentoring junior devs
2. Building teams where questions are welcome
3. Coffee, not necessarily in that order',NULL,'São Paulo, Brazil','[{"prompt":"Offering","answer":"Mentoring conversations for junior devs finding their footing"}]','["Portuguese","English"]','[{"type":"website","value":"https://rafaelsouza.example.com"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-27T12:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('hIsmJgBfZiWowD4PxpfKb','Hana Kobayashi','hana.kobayashi@example.com','# Hi, I''m Hana!

Developer advocate based in Kyoto. I write tutorials, give talks, and collect conference stickers *competitively*.','She/Her','Kyoto, Japan','[{"prompt":"I collect","answer":"Conference stickers, competitively"}]','["Japanese","English"]','[{"type":"website","value":"https://hanakobayashi.example.com"},{"type":"other","label":"Bluesky","value":"@hanak.dev"}]',1,1,1,1,1,1,1,0,1,1,1,1,'/media/avatars/hIsmJgBfZiWowD4PxpfKb.webp?v=1795373588766','2026-10-26T17:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('GmxREzYZDWHhdE3YJBkly','Tereza Nováková','tereza.novakova@example.com','Open source maintainer from Prague — see [my projects](https://github.example.com/tereza). Ask me about sustainable maintainership, or just send `git help`, either works.',NULL,'Prague, Czechia','[{"prompt":"Ask me about","answer":"Sustainable maintainership for projects that outlive their funding"}]','["Czech","English"]','[{"type":"website","value":"https://github.example.com/tereza"}]',1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-25T22:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('2LWBMof-CEnu7UbVFhthf','Ahmad Karimi','ahmad.karimi@example.com','Software engineer from Tehran, now in Amsterdam. Working on developer tooling and learning Dutch, slowly.','He/Him','Amsterdam, Netherlands','[{"prompt":"Currently obsessed with","answer":"Developer tooling, and slowly learning Dutch"}]','["Persian","Dutch","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-25T03:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('v-v-ZCiBTuQ6DTuwf5Uvx','Maria Papadopoulou','maria.papadopoulou@example.com','Tech lead from Thessaloniki. Legacy code whisperer. Strong opinions on testing, loosely held on everything else.',NULL,'Thessaloniki, Greece','[{"prompt":"Offering","answer":"Loosely held opinions on everything except testing"}]','["Greek","English"]',NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-24T08:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('zeC7AGyqkuMKpY5WxbckT','Mateo Quispe','mateo.quispe@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('rJhXeJVBKd4Lll0FKaIWo','Leilani Kahale','leilani.kahale@example.com',NULL,'She/They',NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,'2026-10-22T18:53:08.766Z',0,NULL,NULL,NULL,0,1,1,NULL);
INSERT INTO "guests" VALUES('wMHGn7M3J3QFNXb0hnVAI','Site Admin','site.admin@example.com',NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1,1,0,1,1,1,1,NULL,NULL,1,'scrypt$fGkmJ8z6Y/u+eUfwuK3Eag==$U93Ppq0oyher48WEtiVqYfV7G8Ws6bQXkRAPuXen4Fc=','site-admin',NULL,1,1,1,NULL);
CREATE TABLE `session_marks` (
	`guest_id` text NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`guest_id`, `session_id`),
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `shared_moments` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "shared_moments" VALUES('o4TV82WNYROHhb69qt2hl','ZrjrOCZma-GLivrk320KY','Opening keynote','Everyone in the first room','2026-12-06T08:30:00.000Z','2026-12-06T09:30:00.000Z');
INSERT INTO "shared_moments" VALUES('9wAxVDXANxo-f8pC_aZkr','ZrjrOCZma-GLivrk320KY','Coffee & cake','In the foyer','2026-12-06T14:30:00.000Z','2026-12-06T15:00:00.000Z');
INSERT INTO "shared_moments" VALUES('fqCS9mra0Gj33WlGNmYC1','-zLiB9qouXhJWu3eHtrqV','Coffee & cake','In the foyer','2026-12-07T14:30:00.000Z','2026-12-07T15:00:00.000Z');
INSERT INTO "shared_moments" VALUES('rS5G-PUo0yXeIj5fopiq9','plOsEqb-kS7xexJVcfBvG','Coffee & cake','In the foyer','2026-12-08T14:30:00.000Z','2026-12-08T15:00:00.000Z');
CREATE TABLE `meeting_nudges` (
	`event_id` text NOT NULL,
	`asker_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`created_at` text NOT NULL,
	`answered_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asker_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `event_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "event_labels" VALUES('uB8_BIU6NgsM1JqOL75ST','tCNQtXjwgJKS47DHOu32C','Organizer','Runs this event. Ask them about anything, from rooms to the schedule.','red',0);
INSERT INTO "event_labels" VALUES('1AZk8smk3AOh5MVlXPUEW','tCNQtXjwgJKS47DHOu32C','Photographer','Takes photos in sessions. Tell them if you''d rather not be in a picture.','blue',1);
INSERT INTO "event_labels" VALUES('cTK-cPRz3ZRUzKqTilk5Z','tCNQtXjwgJKS47DHOu32C','Welfare','Talk to them, in confidence, if something feels wrong or you need help.','green',2);
INSERT INTO "event_labels" VALUES('H7jqy8JdKGGion3o4-iJ2','y74c07QXIkssDeblYsOSY','Organizer','Runs this event. Ask them about anything, from rooms to the schedule.','red',0);
INSERT INTO "event_labels" VALUES('5x27lkLKX4CHMq9dCQ5aT','y74c07QXIkssDeblYsOSY','Photographer','Takes photos in sessions. Tell them if you''d rather not be in a picture.','blue',1);
INSERT INTO "event_labels" VALUES('MGmeXNTlW21JloyxGQRiu','y74c07QXIkssDeblYsOSY','Welfare','Talk to them, in confidence, if something feels wrong or you need help.','green',2);
INSERT INTO "event_labels" VALUES('SJJ7UKNg9QNJcsiyKftzZ','PPGDvamTBn3-mmtGaFpIs','Organizer','Runs this event. Ask them about anything, from rooms to the schedule.','red',0);
INSERT INTO "event_labels" VALUES('bntJ3eHSNhVjBi5CUvtEd','PPGDvamTBn3-mmtGaFpIs','Photographer','Takes photos in sessions. Tell them if you''d rather not be in a picture.','blue',1);
INSERT INTO "event_labels" VALUES('Pm6GlR38YLEIuCywYx30U','PPGDvamTBn3-mmtGaFpIs','Welfare','Talk to them, in confidence, if something feels wrong or you need help.','green',2);
CREATE TABLE `guest_labels` (
	`event_label_id` text NOT NULL,
	`guest_id` text NOT NULL,
	PRIMARY KEY(`event_label_id`, `guest_id`),
	FOREIGN KEY (`event_label_id`) REFERENCES `event_labels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "guest_labels" VALUES('uB8_BIU6NgsM1JqOL75ST','6tQX6-ck20zvyo1Q78kcr');
INSERT INTO "guest_labels" VALUES('1AZk8smk3AOh5MVlXPUEW','ZgqjVdi01mWWPTcE6HcFp');
INSERT INTO "guest_labels" VALUES('cTK-cPRz3ZRUzKqTilk5Z','4NihDOqv7M8nE5B5bF85j');
INSERT INTO "guest_labels" VALUES('H7jqy8JdKGGion3o4-iJ2','pM17gpIj2Josz5tiFZ1el');
INSERT INTO "guest_labels" VALUES('5x27lkLKX4CHMq9dCQ5aT','XC1WD3CPb71Kuu-q4FQEk');
INSERT INTO "guest_labels" VALUES('MGmeXNTlW21JloyxGQRiu','ZDk7oXJvG4aIJGinraw1-');
INSERT INTO "guest_labels" VALUES('SJJ7UKNg9QNJcsiyKftzZ','EHsKrkDZ1krZzBzmwozA4');
INSERT INTO "guest_labels" VALUES('SJJ7UKNg9QNJcsiyKftzZ','NeVPC4sOIpHAFioNYmgzv');
INSERT INTO "guest_labels" VALUES('bntJ3eHSNhVjBi5CUvtEd','ID7ZhNxS1jNfhPMDxVxJL');
INSERT INTO "guest_labels" VALUES('Pm6GlR38YLEIuCywYx30U','q4O1MRMpeQlO0TyrxQd_R');
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
CREATE INDEX `votes_guest_idx` ON `votes` (`guest_id`);
CREATE INDEX `votes_proposal_choice_idx` ON `votes` (`proposal_id`,`choice`);
CREATE INDEX `shared_moments_day_idx` ON `shared_moments` (`day_id`);
CREATE UNIQUE INDEX `meeting_nudges_no_duplicate` ON `meeting_nudges` (`event_id`,`asker_id`,`recipient_id`);
CREATE INDEX `meeting_nudges_recipient_idx` ON `meeting_nudges` (`event_id`,`recipient_id`);
CREATE INDEX `event_labels_event_idx` ON `event_labels` (`event_id`);
CREATE INDEX `guest_labels_guest_idx` ON `guest_labels` (`guest_id`);
CREATE UNIQUE INDEX `events_link_token_unique` ON `events` (`link_token`);
CREATE UNIQUE INDEX `events_kiosk_token_unique` ON `events` (`kiosk_token`);
COMMIT;
