-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Már 26. 13:10
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `mestermunka`
--
create database if not exists `mestermunka` default character set utf8mb4 collate utf8mb4_hungarian_ci;
use `mestermunka`;
-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'ADMIN1234', '$2b$10$VKgpy11cZE3TiwA0SebqGecQKEx3hyyd37SpPmsf1YO9GE/1XgnfK');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jelentkezesek`
--

CREATE TABLE `jelentkezesek` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `kepzes_id` int(11) NOT NULL,
  `jelentkezes_datum` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `jelentkezesek`
--

INSERT INTO `jelentkezesek` (`id`, `user_id`, `kepzes_id`, `jelentkezes_datum`) VALUES
(6, 14, 29, '2026-01-22 11:03:09'),
(7, 14, 30, '2026-01-22 11:07:07'),
(9, 14, 29, '2026-02-24 17:00:18'),
(11, 26, 55, '2026-02-25 17:46:44');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kepzesek`
--

CREATE TABLE `kepzesek` (
  `id` int(11) NOT NULL,
  `kep` varchar(255) DEFAULT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `leiras` text DEFAULT NULL,
  `helyileg` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `o_nev` varchar(45) DEFAULT NULL,
  `heves_kortol` int(3) DEFAULT NULL,
  `uv_ID` int(11) DEFAULT NULL,
  `ua_ID` int(11) DEFAULT NULL,
  `ar` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kepzesek`
--

INSERT INTO `kepzesek` (`id`, `kep`, `nev`, `leiras`, `helyileg`, `email`, `o_nev`, `heves_kortol`, `uv_ID`, `ua_ID`, `ar`) VALUES
(27, 'körms.jpg', 'Körmös Tanfolyam', 'Műköröm építés alap és haladó technikákkal. Időtartam: 6 hét, heti 2 alkalommal 4 órában. Kezdés: minden hónap első hétfőjén. Tananyag: higiénia, előkészítés, zselés és porcelán építés, reszelési technikák, díszítések, töltés, vendégkezelés. Gyakorlati oktatás modelleken. A képzés végén tanúsítvány és gyakorlati vizsga.', 'Budapest', 'info@szepseg.hu', 'Kiss Anna', 16, NULL, NULL, 85000),
(28, 'gellakk.jpg', 'Géllakk Tanfolyam', 'Tartós géllakk technikák kezdőknek. Időtartam: 3 hét, heti 2 alkalom 3 órában. Kezdés: folyamatos. Tananyag: köröm előkészítés, alapok, színfelvitel, megerősített géllakk, eltávolítás, alap díszítések, eszközhasználat. Gyakorlat modelleken, tanúsítvány a végén.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 16, NULL, NULL, 45000),
(29, 'muszepillaepites.jpg', 'Műszempilla Építő Tanfolyam', '1D–2D szempilla építés gyakorlattal. Időtartam: 5 hét, heti 2 alkalom 4 órában. Tananyag: anatómia, ragasztók és anyagok, klasszikus építés, töltés, eltávolítás, higiénia, vendégkonzultáció. Minősítő vizsga és tanúsítvány.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, 95000),
(30, 'lifting.jpg', 'Pillalifting Tanfolyam', 'Természetes pillalifting technikák. Időtartam: 2 hét, heti 2 alkalom 3 órában. Tananyag: lifting eljárás, festés, utóápolás, kontraindikációk, biztonságos munkavégzés. Tanúsítvány biztosított.', 'Budapest', 'info@szepseg.hu', 'Tóth Petra', 18, NULL, NULL, 40000),
(31, 'laminalas.jpg', 'Szemöldök Laminálás', 'Szemöldök formázás és laminálás gyakorlati képzéssel. Időtartam: 2 hét, heti 2 alkalom. Tananyag: formázás, festés, laminálás, arcelemzés, higiénia, vendégkommunikáció. Tanúsítvány a képzés végén.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, 35000),
(32, 'alapsmink.jpg', 'Sminkes Alap Tanfolyam', 'Nappali és alkalmi sminkek készítése. Időtartam: 4 hét, heti 2 alkalom 3 órában. Tananyag: bőrtípusok, alapozás, kontúrozás, szem- és ajaktechnikák, eszközök, fertőtlenítés. Gyakorlati oktatás modelleken, tanúsítvánnyal.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 16, NULL, NULL, 65000),
(33, 'manikur.jpg', 'Manikűr Tanfolyam', 'Alap és dekorációs manikűr technikák. Időtartam: 4 hét, heti 2 alkalom. Tananyag: körömápolás, formázás, lakkozás, francia technika, díszítések, higiénia. Tanúsítvány a végén.', 'Budapest', 'info@szepseg.hu', 'Kiss Petra', 16, NULL, NULL, 50000),
(34, 'pedikur.jpg', 'Pedikűr Haladó Tanfolyam', 'Speciális pedikűr technikák és spa kezelések. Időtartam: 5 hét, heti 2 alkalom. Tananyag: problémás lábak kezelése, bőrápolás, spa eljárások, fertőtlenítés, vendégkezelés. Gyakorlati vizsgával.', 'Budapest', 'info@szepseg.hu', 'Nagy Lilla', 18, NULL, NULL, 75000),
(35, 'fodrasz.jpg', 'Fodrász Haladó Tanfolyam', 'Haladó vágás, festés és hajformázás. Időtartam: 8 hét, heti 3 alkalom. Tananyag: modern vágási formák, festési technikák, balayage, styling, eszközhasználat. Záróvizsga és tanúsítvány.', 'Budapest', 'info@szepseg.hu', 'Kovács Anna', 18, NULL, NULL, 120000),
(36, 'extrasmink.jpg', 'Smink Profi Tanfolyam', 'Professzionális smink technikák modelleken. Időtartam: 6 hét, heti 2 alkalom. Tananyag: fotó- és alkalmi smink, színelmélet, eszközhasználat, higiénia. Portfólióépítés és tanúsítvány.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 18, NULL, NULL, 110000),
(37, 'skin.jpg', 'Arcpakolás és Bőrápolás', 'Személyre szabott arcpakolások és kezelések. Időtartam: 3 hét, heti 2 alkalom. Tananyag: bőrtípusok, hatóanyagok, arcmasszázs, higiénia, kezelési protokollok. Tanúsítvány a végén.', 'Budapest', 'info@szepseg.hu', 'Szabó Réka', 18, NULL, NULL, 55000),
(39, 'műszempiilas.jpg', 'Szempilla Haladó Tanfolyam', 'Volume és hybrid szempilla építés. Időtartam: 4 hét, heti 2 alkalom 4 órában. Tananyag: fan készítés, volume technikák, töltés, eltávolítás, biztonságos ragasztóhasználat. Minősítő vizsga.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, 85000),
(40, 'haladoszemoldok.jpg', 'Szemöldök Laminálás Haladó', 'Haladó szemöldök laminálás és formázás. Időtartam: 2 hét, heti 2 alkalom. Tananyag: haladó formázási technikák, festés, arcelemzés, vendégkezelés. Tanúsítvány biztosított.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, 45000),
(41, 'gellakhalado.jpg', 'Géllakk Haladó Tanfolyam', 'Komplex minták és díszítések géllakkal. Időtartam: 3 hét, heti 2 alkalom. Tananyag: haladó díszítések, megerősítés, trend technikák, anyagismeret. Gyakorlati oktatás.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 18, NULL, NULL, 55000),
(42, 'barber.jpg', 'Barber / Férfi Fodrász Tanfolyam', 'Borotválás, férfi hajvágás és styling. Időtartam: 6 hét, heti 2 alkalom. Tananyag: klasszikus és modern férfi frizurák, szakállápolás, borotválási technikák, higiénia. Záróvizsga.', 'Budapest', 'info@szepseg.hu', 'Kovács Péter', 18, NULL, NULL, 135000),
(44, 'asztalossjpg.jpg', 'Asztalos Mesterkurzus', 'Alap- és haladó asztalos technikák. Időtartam: 10 hét, heti 2 gyakorlati nap. Tananyag: faanyagok, kézi és gépi megmunkálás, kötéselemek, felületkezelés. Tanúsítvány.', 'Budapest, Barkács utca 4.', 'info@asztalos.hu', 'Kovács László', 18, NULL, NULL, 250000),
(45, 'autoszzerelo.jpg', 'Autószerelő Alapok', 'Gépjárművek karbantartása és javítása. Időtartam: 12 hét, heti 2 alkalom. Tananyag: motor alapok, fékrendszer, diagnosztika, biztonságos munkavégzés. Gyakorlati vizsga.', 'Győr, Szerviz út 12.', 'info@autoszerelo.hu', 'Nagy István', 17, NULL, NULL, 320000),
(46, 'cukrasz.jpg', 'Cukrász Tanfolyam', 'Torták, sütemények és desszertek készítése online. Időtartam: 8 hét, heti 2 élő óra. Tananyag: alaptechnikák, krémek, díszítés, tálalás, higiénia.', 'Online', 'info@cukrasz.hu', 'Tóth Anna', 16, NULL, NULL, 180000),
(47, 'heggeszto.jpg', 'Hegesztő Alapok', 'Különböző hegesztési technikák gyakorlati oktatással. Időtartam: 8 hét, heti 2 alkalom. Tananyag: MIG/MAG, bevont elektródás hegesztés, munkavédelem. Tanúsítvány.', 'Miskolc, Ipari Park', 'info@hegeszto.hu', 'Farkas Péter', 18, NULL, NULL, 280000),
(48, 'masszazs.jpg', 'Masszőr Tanfolyam', 'Relaxációs és terápiás masszázs technikák online elmélettel és gyakorlati nappal. Időtartam: 6 hét. Tananyag: anatómia, fogások, kontraindikációk, vendégkezelés.', 'Online', 'info@masszazs.hu', 'Horváth Judit', 18, NULL, NULL, 140000),
(49, 'rogramozo.jpg', 'Programozó Alapok', 'Programozás alapjai és gyakorlati projektek online. Időtartam: 10 hét, heti 3 alkalom. Tananyag: algoritmusok, változók, ciklusok, web alapok, projektmunka. Tanúsítvány.', 'Online', 'info@programozas.hu', 'Szabó Gábor', 16, NULL, NULL, 450000),
(50, 'szakaccs.jpg', 'Szakács Tanfolyam', 'Ételkészítés és konyhai technikák. Időtartam: 8 hét, heti 2 gyakorlati nap. Tananyag: alaptechnikák, nemzetközi konyha, tálalás, higiénia. Záróvizsga.', 'Budapest, Gasztro tér 1.', 'info@szakacs.hu', 'Balogh Erika', 16, NULL, NULL, 210000),
(51, 'vezetes.jpg', 'Vezetési Tanfolyam', 'Biztonságos és hatékony vezetési gyakorlat. Időtartam: 6 hét, heti 2 alkalom. Tananyag: járműkezelés, közlekedési szabályok, rutin és forgalmi gyakorlat.', 'Debrecen, Autós tanpálya', 'info@vezetes.hu', 'Molnár Péter', 17, NULL, NULL, 90000),
(52, 'villanyszzerelo.jpg', 'Villanyszerelő Alapok', 'Elektromos rendszerek telepítése és karbantartása. Időtartam: 10 hét, heti 2 alkalom. Tananyag: áramkörök, szerelés, hibakeresés, munkavédelem. Tanúsítvány.', 'Szeged, Feszültség köz 5.', 'info@villany.hu', 'Kiss András', 18, NULL, NULL, 240000),
(53, 'festo.jpg', 'Festő Tanfolyam', 'Beltéri és kültéri festési technikák. Időtartam: 6 hét, heti 2 alkalom. Tananyag: felület-előkészítés, festési módszerek, anyagismeret, biztonság.', 'Budapest, Szín-ház utca 2.', 'info@festo.hu', 'Németh Ágnes', 18, NULL, NULL, 160000),
(54, 'tetofedo.jpg', 'Tetőfedő Tanfolyam', 'Tetőfedés és javítás alapjai. Időtartam: 8 hét, heti 2 alkalom. Tananyag: fedési technikák, szigetelés, anyagismeret, munkavédelem. Gyakorlati vizsga.', 'Érd, Magas tető út 1.', 'info@tetkos.hu', 'Pál Gábor', 18, NULL, NULL, 290000),
(55, 'klima.jpg', 'Klímaszerelő Alapok', 'Légkondicionáló rendszerek telepítése és karbantartása. Időtartam: 8 hét, heti 2 alkalom. Tananyag: szerelés, karbantartás, hűtőközeg-kezelés, biztonság.', 'Budapest, Hűtő körút 10.', 'info@klima.hu', 'Varga Attila', 18, NULL, NULL, 260000),
(100, 'festes_alap.jpg', 'Festő Alap Tanfolyam', 'Festő alaptanfolyam beltéri és kültéri felületekre. Időtartam: 4 hét, heti 2 alkalom 17:00–20:00. Tananyag: alapozás, ecset- és hengerhasználat, színek, festési technikák, gyakorlati feladatok. Kezdés: 2026.03.01.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 16, NULL, NULL, 65000),
(101, 'festes_halado.jpg', 'Festő Haladó Tanfolyam', 'Haladó festő tanfolyam beltéri és kültéri felületekre, különböző anyagokkal. Időtartam: 6 hét, heti 3 alkalom. Tananyag: speciális festési technikák, dekorációs megoldások, színek keverése, felületkezelés.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 95000),
(102, 'rajz_alap.jpg', 'Rajz Alapok Tanfolyam', 'Rajz alapozó tanfolyam kezdőknek. Időtartam: 3 hét, heti 2 alkalom. Tananyag: vonalvezetés, árnyékolás, perspektíva, alapvető formák, ceruza- és tolltechnikák.', 'Online', 'info@tanfolyam.hu', 'Tanfolyam.hu', 16, NULL, NULL, 45000),
(103, 'rajz_halado.jpg', 'Haladó Rajz Tanfolyam', 'Haladó rajz technikák. Időtartam: 6 hét, heti 2–3 alkalom. Tananyag: portré, emberi test, kompozíció, árnyékolás és perspektíva haladó szinten. Gyakorlat modelleken.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 85000),
(104, 'barkacs_alap.jpg', 'Barkács Alap Tanfolyam', 'Barkács alapok. Időtartam: 3 hét, heti 2 alkalom. Tananyag: kézi szerszámok használata, alapanyagok, egyszerű fa- és fémprojektek. Kezdés: 2026.02.28.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 16, NULL, NULL, 40000),
(105, 'barkacs_halado.jpg', 'Haladó Barkács Tanfolyam', 'Haladó barkács képzés fa- és fémprojektekhez. Időtartam: 5 hét, heti 3 alkalom. Tananyag: precíziós vágás, csiszolás, festés, szerelés, saját projekt készítése.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 75000),
(108, 'kozmetika.png', 'Kozmetikai Alap Tanfolyam', 'Alap kozmetikai tanfolyam: arcpakolás, bőrápolás, alap smink, higiénia. Időtartam: 4 hét, heti 2 alkalom.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 16, NULL, NULL, 55000),
(109, 'kozmetika_halado.png', 'Kozmetikai Haladó Tanfolyam', 'Haladó kozmetikai képzés modelleken. Időtartam: 6 hét, heti 3 alkalom. Tananyag: profi smink, szemöldök laminálás, pillalifting, kezelési protokoll.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 110000),
(113, 'masszor.png\r\n', 'Masszőr Haladó', 'Haladó masszázstechnika: thai, sport, relax. Időtartam: 6 hét, heti 3 alkalom.', 'Budapest', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 125000),
(115, 'programozo.png', 'Programozó Haladó', 'Haladó programozás, adatbázis-kezelés, webfejlesztés. Időtartam: 8 hét, heti 3 alkalom.', 'Online', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 650000),
(116, 'ingatlanos.png', 'Ingatlanvagyon Értékelő és Közvetítő', 'Államilag elismert szakképesítés. Időtartam: 4 hónap, heti 2–3 alkalom online. Tananyag: ingatlanpiac, értékelés, riportkészítés, jogi alapismeretek. Tanúsítvány a végén.', 'Online', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 139000),
(117, 'Ingatlankezelő.png\r\n', 'Ingatlankezelő Szakképesítés', 'Ingatlankezelő képzés online vagy kontakt formában. Időtartam: 3 hónap, heti 2 alkalom. Tananyag: ingatlan adminisztráció, társasházkezelés, jogi alapok. Tanúsítvány a végén.', 'Több város', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 79000),
(118, 'dajka.png', 'Dajka Szakképesítés', 'Dajka (gyermekgondozó) képzés. Időtartam: 8–10 hét, heti online és kontakt órák. Tananyag: gyermekpszichológia, higiénia, elsősegély, gondozás. Tanúsítvány a végén.', 'Több város', 'info@tanfolyam.hu', 'Tanfolyam.hu', 16, NULL, NULL, 65000),
(126, 'szaloninditas.png\r\n', 'Szalonindítás Alapok', 'Szépségipari vállalkozás indítása. Időtartam: 2 hét, online vagy kontakt. Tananyag: marketing, ügyfélkezelés, pénzügy.', 'Online', 'info@tanfolyam.hu', 'Tanfolyam.hu', 18, NULL, NULL, 30000);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_ado`
--

CREATE TABLE `user_ado` (
  `ua_id` int(11) NOT NULL,
  `felhasznalonev` varchar(45) DEFAULT NULL,
  `jelszo` varchar(100) DEFAULT NULL,
  `gmail` varchar(45) DEFAULT NULL,
  `vegzettseg` varchar(45) DEFAULT NULL,
  `profilkep` varchar(255) NOT NULL,
  `bemutatkozas` text NOT NULL,
  `regisztracio_datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_ado`
--

INSERT INTO `user_ado` (`ua_id`, `felhasznalonev`, `jelszo`, `gmail`, `vegzettseg`, `profilkep`, `bemutatkozas`, `regisztracio_datum`) VALUES
(13, 'doha', '$2b$10$4ISzgLhidxgGb8OJv75xUOyqmXSITfee0cJZil2oSnxXiXmHgdERu', 'doha@gmail.com', 'egyetemista', '', '', '2026-03-26 11:10:23'),
(14, 'ujfelhasznalo', '$2b$10$hltgQEW1QH8nKQnz.I0t..ig4oAlivDwK46HryGD/.2HSsjhI1HDW', 'ujfelhasznalo@gmail.com', 'egyetemista', '1771873702485-received_451344334448871.jpeg', '', '2026-03-26 11:10:23'),
(15, 'anyus', '$2b$10$to1AKWEbRQxdZCzASq2I9OefjrVxCotKaWYh0acKV14qHzsgb5y.e', 'anyus@gmail.com', 'bsc', '', '', '2026-03-26 11:10:23'),
(16, 'panna', '$2b$10$/IVs6YUueil0AmzyWgFEourfnbZbwNmVnAq4qJmSW9nj/c1bzSEaa', 'panna@gmail.com', 'erettsegi', '1772036100421-OIP.webp', 'olkhzgt76', '2026-03-26 11:10:23'),
(17, 'ditte', '$2b$10$iXBpFOuz9fJu7CHFJPdBWOJedgDER5/DpcLgzDxKhwzC4zmU8BlH2', 'ditte@gmail.com', 'egyeb', '', '', '2026-03-26 11:10:23'),
(18, 'kitti', '$2b$10$BrY.Cj2m8Q7AjAqpaw48E.8kcrv2qbXYerV6MmuxoezHqwBKKIJ7K', 'kitti@gmail.com', 'msc', '', '', '2026-03-26 11:11:27');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_vevo`
--

CREATE TABLE `user_vevo` (
  `uv_id` int(11) NOT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `felhasznalonev` varchar(45) DEFAULT NULL,
  `jelszo` varchar(80) DEFAULT NULL,
  `regisztracio_datum` timestamp NULL DEFAULT NULL,
  `profilkep` varchar(255) NOT NULL,
  `bemutatkozas` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_vevo`
--

INSERT INTO `user_vevo` (`uv_id`, `nev`, `email`, `felhasznalonev`, `jelszo`, `regisztracio_datum`, `profilkep`, `bemutatkozas`) VALUES
(14, 'anyuka', 'anyuka@gmail.com', 'anyuka', '$2b$10$CoSm3hQo9vkDN8jiwpS./e5slO10CuPbi3zBoykCNZQC7izfWCYtW', '2026-01-22 10:56:34', '1771956124744-OIP.webp', 'ki76uj5hzgt'),
(23, 'katy', 'katy@gmail.com', 'katy', '$2b$10$Zij6k0qX3SRpc0fXr.k6jeB9HYna3zCW5JMq61HE38OOMwUV6x0hK', '2026-01-29 12:01:55', '', ''),
(24, 'vivi', 'vivi@gmai.com', 'vivi', '$2b$10$AMcRTAoTeZRb.1XFhhbm0u90BAvrhTAQXZfKHKbaH4b3aLFOLtsBW', '2026-01-29 12:14:00', '', ''),
(25, 'kerlek', 'kerlek@gmail.com', 'kerlek', '$2b$10$mCwE0rmvVufcvR/zcSA.H.g4ogx15CWEhAcfpldRWsgIkxNKNSaCS', '2026-02-15 15:10:53', '', ''),
(26, 'gabor', 'gabor@gmail.com', 'gabor', '$2b$10$Q7KwJ2ktq/5N97mCMUB9qOIhudBn0rp/3vAQMHaZVjaTymHQu.fH2', '2026-02-25 17:46:01', '1772041837938-OIP.webp', 'gabor vagyok egy diak es szeretnek kepzesekre jelentkezni');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `uzenetek`
--

CREATE TABLE `uzenetek` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `uzenet` text NOT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `uzenetek`
--

INSERT INTO `uzenetek` (`id`, `nev`, `email`, `uzenet`, `datum`) VALUES
(1, 'laednf', 'joskit208@hengersor.hu', 'gvjdf', '2026-02-15 11:59:31'),
(2, 'kitti', 'joseffikitti@gmail.com', 'csak kivancsi vagyok hogy mikodik e ez a kapcsolatok kuldese adatbazisba', '2026-02-24 17:01:23'),
(3, 'gabor', 'gabor@gmail.com', 'uhcsbvdrj', '2026-02-25 17:49:56');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vegzettseg`
--

CREATE TABLE `vegzettseg` (
  `id_veg` int(11) NOT NULL,
  `legmagasabb` varchar(45) DEFAULT NULL,
  `uv_idegenID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `jelentkezesek`
--
ALTER TABLE `jelentkezesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kepzes_id` (`kepzes_id`);

--
-- A tábla indexei `kepzesek`
--
ALTER TABLE `kepzesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uv_ID` (`uv_ID`,`ua_ID`),
  ADD KEY `ua_ID` (`ua_ID`);

--
-- A tábla indexei `user_ado`
--
ALTER TABLE `user_ado`
  ADD PRIMARY KEY (`ua_id`);

--
-- A tábla indexei `user_vevo`
--
ALTER TABLE `user_vevo`
  ADD PRIMARY KEY (`uv_id`);

--
-- A tábla indexei `uzenetek`
--
ALTER TABLE `uzenetek`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `vegzettseg`
--
ALTER TABLE `vegzettseg`
  ADD PRIMARY KEY (`id_veg`),
  ADD KEY `uv_idegenID` (`uv_idegenID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `jelentkezesek`
--
ALTER TABLE `jelentkezesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `kepzesek`
--
ALTER TABLE `kepzesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT a táblához `user_ado`
--
ALTER TABLE `user_ado`
  MODIFY `ua_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `user_vevo`
--
ALTER TABLE `user_vevo`
  MODIFY `uv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT a táblához `uzenetek`
--
ALTER TABLE `uzenetek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `vegzettseg`
--
ALTER TABLE `vegzettseg`
  MODIFY `id_veg` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `jelentkezesek`
--
ALTER TABLE `jelentkezesek`
  ADD CONSTRAINT `jelentkezesek_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_vevo` (`uv_id`),
  ADD CONSTRAINT `jelentkezesek_ibfk_2` FOREIGN KEY (`kepzes_id`) REFERENCES `kepzesek` (`id`);

--
-- Megkötések a táblához `kepzesek`
--
ALTER TABLE `kepzesek`
  ADD CONSTRAINT `kepzesek_ibfk_1` FOREIGN KEY (`ua_ID`) REFERENCES `user_ado` (`ua_id`),
  ADD CONSTRAINT `kepzesek_ibfk_2` FOREIGN KEY (`uv_ID`) REFERENCES `user_vevo` (`uv_id`);

--
-- Megkötések a táblához `vegzettseg`
--
ALTER TABLE `vegzettseg`
  ADD CONSTRAINT `vegzettseg_ibfk_1` FOREIGN KEY (`uv_idegenID`) REFERENCES `user_vevo` (`uv_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
