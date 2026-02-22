-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Feb 15. 16:11
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.0.30

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
CREATE DATABASE IF NOT EXISTS `mestermunka` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `mestermunka`;
-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ajanlo`
--

CREATE TABLE `ajanlo` (
  `ajanlo_id` int(11) NOT NULL,
  `kerdesek_valaszai_ID` int(11) NOT NULL,
  `ajanlott_kepzes(kepzes id-ja))` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

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
(7, 14, 30, '2026-01-22 11:07:07');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kepzesek`
--

CREATE TABLE `kepzesek` (
  `id` int(11) NOT NULL,
  `kep` varchar(200) DEFAULT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `leiras` varchar(45) DEFAULT NULL,
  `helyileg` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `o_nev` varchar(45) DEFAULT NULL,
  `heves_kortol` int(3) DEFAULT NULL,
  `uv_ID` int(11) DEFAULT NULL,
  `ua_ID` int(11) DEFAULT NULL,
  `ár` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kepzesek`
--

INSERT INTO `kepzesek` (`id`, `kep`, `nev`, `leiras`, `helyileg`, `email`, `o_nev`, `heves_kortol`, `uv_ID`, `ua_ID`, `ár`) VALUES
(27, 'körms.jpg', 'Körmös Tanfolyam', 'Műköröm építés alap és haladó technikákkal.', 'Budapest', 'info@szepseg.hu', 'Kiss Anna', 16, NULL, NULL, 0),
(28, 'gellakk.jpg', 'Géllakk Tanfolyam', 'Tartós géllakk technikák kezdőknek.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 16, NULL, NULL, 0),
(29, 'muszepillaepites.jpg', 'Műszempilla Építő Tanfolyam', '1D–2D szempilla építés gyakorlattal.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, 0),
(30, 'lifting.jpg', 'Pillalifting Tanfolyam', 'Természetes pillalifting technikák.', 'Budapest', 'info@szepseg.hu', 'Tóth Petra', 18, NULL, NULL, 0),
(31, 'laminalas.jpg', 'Szemöldök Laminálás', 'Szemöldök formázás és laminálás.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, 0),
(32, 'alapsmink.jpg', 'Sminkes Alap Tanfolyam', 'Nappali és alkalmi sminkek készítése.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 16, NULL, NULL, 0),
(33, 'manikur.jpg', 'Manikűr Tanfolyam', 'Alap és dekorációs manikűr technikák.', 'Budapest', 'info@szepseg.hu', 'Kiss Petra', 16, NULL, NULL, 0),
(34, 'pedikur.jpg', 'Pedikűr Haladó Tanfolyam', 'Speciális pedikűr technikák és spa kezelések.', 'Budapest', 'info@szepseg.hu', 'Nagy Lilla', 18, NULL, NULL, 0),
(35, 'fodrasz.jpg', 'Fodrász Haladó Tanfolyam', 'Haladó vágás, festés és hajformázás.', 'Budapest', 'info@szepseg.hu', 'Kovács Anna', 18, NULL, NULL, 0),
(36, 'extrasmink.jpg', 'Smink Profi Tanfolyam', 'Professzionális smink technikák, modellekre.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 18, NULL, NULL, 0),
(37, 'skin.jpg', 'Arcpakolás és Bőrápolás', 'Személyre szabott arcpakolások és kezelések.', 'Budapest', 'info@szepseg.hu', 'Szabó Réka', 18, NULL, NULL, 0),
(39, 'műszempiilas.jpg', 'Szempilla Haladó Tanfolyam', 'Volume és hybrid szempilla építés.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, 0),
(40, 'haladoszemoldok.jpg', 'Szemöldök Laminálás Haladó', 'Haladó laminálás és formázás technikák.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, 0),
(41, 'gellakhalado.jpg', 'Géllakk Haladó Tanfolyam', 'Komplex minták és díszítések géllakkal.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 18, NULL, NULL, 0),
(42, 'barber.jpg', 'Barber / Férfi Fodrász Tanfolyam', 'Borotválás, férfi hajvágás és styling.', 'Budapest', 'info@szepseg.hu', 'Kovács Péter', 18, NULL, NULL, 0),
(43, 'busniess.jpg', 'Szalonindítás Alapok', 'Szépségipari vállalkozás indítása.', 'Online', 'info@szepseg.hu', 'Vincze Péter', 18, NULL, NULL, 0),
(44, 'asztalossjpg.jpg', 'Asztalos Mesterkurzus', 'Alap- és haladó asztalos technikák.', 'Offline', 'info@asztalos.hu', 'Kovács László', 24, NULL, NULL, 0),
(45, 'autoszzerelo.jpg', 'Autószerelő Alapok', 'Gépjárművek karbantartása és javítása.', 'Offline', 'info@autoszerelo.hu', 'Nagy István', 40, NULL, NULL, 0),
(46, 'cukrasz.jpg', 'Cukrász Tanfolyam', 'Torták, sütemények és desszertek készítése.', 'Online', 'info@cukrasz.hu', 'Tóth Anna', 30, NULL, NULL, 0),
(47, 'heggeszto.jpg', 'Hegesztő Alapok', 'Különböző hegesztési technikák gyakorlati okt', 'Offline', 'info@hegeszto.hu', 'Farkas Péter', 36, NULL, NULL, 0),
(48, 'masszazs.jpg', 'Masszőr Tanfolyam', 'Relaxációs és terápiás masszázs technikák.', 'Online', 'info@masszazs.hu', 'Horváth Judit', 20, NULL, NULL, 0),
(49, 'rogramozo.jpg', 'Programozó Alapok', 'Programozás alapjai és gyakorlati projektek.', 'Online', 'info@programozas.hu', 'Szabó Gábor', 50, NULL, NULL, 0),
(50, 'szakaccs.jpg', 'Szakács Tanfolyam', 'Ételkészítés és konyhai technikák.', 'Offline', 'info@szakacs.hu', 'Balogh Erika', 45, NULL, NULL, 0),
(51, 'vezetes.jpg', 'Vezetési Tanfolyam', 'Biztonságos és hatékony vezetési gyakorlat.', 'Offline', 'info@vezetes.hu', 'Molnár Péter', 25, NULL, NULL, 0),
(52, 'villanyszzerelo.jpg', 'Villanyszerelő Alapok', 'Elektromos rendszerek telepítése és karbantar', 'Offline', 'info@villany.hu', 'Kiss András', 40, NULL, NULL, 0),
(53, 'festo.jpg', 'Festő Tanfolyam', 'Beltéri és kültéri festési technikák.', 'Offline', 'info@festo.hu', 'Németh Ágnes', 28, NULL, NULL, 0),
(54, 'tetofedo.jpg', 'Tetőfedő Tanfolyam', 'Tetőfedés és javítás alapjai.', 'Offline', 'info@tetkos.hu', 'Pál Gábor', 35, NULL, NULL, 0),
(55, 'klima.jpg', 'Klímaszerelő Alapok', 'Légkondicionáló rendszerek telepítése és karb', 'Offline', 'info@klima.hu', 'Varga Attila', 32, NULL, NULL, 0),
(56, NULL, 'valami', 'feuifesjnl', 'Pest', 'doha@gmail.com', NULL, NULL, NULL, 13, 12345),
(57, NULL, 'ujtanfolyam', 'ujtanfolyam hozzaadasddge', 'Budapest hengersor utca ', 'Ujtanfolyam@gmail.com', NULL, NULL, NULL, 14, 123456789);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_ado`
--

CREATE TABLE `user_ado` (
  `ua_id` int(11) NOT NULL,
  `felhasznalonev` varchar(45) DEFAULT NULL,
  `jelszo` varchar(100) DEFAULT NULL,
  `gmail` varchar(45) DEFAULT NULL,
  `vegzettseg` varchar(45) DEFAULT NULL
  `profilkep` varchar(255) DEFAULT NULL
  `bemutatkozas` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_ado`
--

INSERT INTO `user_ado` (`ua_id`, `felhasznalonev`, `jelszo`, `gmail`, `vegzettseg`) VALUES
(13, 'doha', '$2b$10$4ISzgLhidxgGb8OJv75xUOyqmXSITfee0cJZil2oSnxXiXmHgdERu', 'doha@gmail.com', 'egyetemista'),
(14, 'ujfelhasznalo', '$2b$10$hltgQEW1QH8nKQnz.I0t..ig4oAlivDwK46HryGD/.2HSsjhI1HDW', 'ujfelhasznalo@gmail.com', 'egyetemista');

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
  `regisztracio_datum` timestamp NULL DEFAULT NULL
  `profilkep` varchar(255) DEFAULT NULL
  `bemutatkozas` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_vevo`
--

INSERT INTO `user_vevo` (`uv_id`, `nev`, `email`, `felhasznalonev`, `jelszo`, `regisztracio_datum`) VALUES
(14, 'anyuka', 'anyuka@gmail.com', 'anyuka', '$2b$10$qlPOB049twjkC1i0QnGVwe1VaeLhIhzPVuZt8n3vqyD3oSisbU1P6', '2026-01-22 10:56:34'),
(23, 'katy', 'katy@gmail.com', 'katy', '$2b$10$Zij6k0qX3SRpc0fXr.k6jeB9HYna3zCW5JMq61HE38OOMwUV6x0hK', '2026-01-29 12:01:55'),
(24, 'vivi', 'vivi@gmai.com', 'vivi', '$2b$10$AMcRTAoTeZRb.1XFhhbm0u90BAvrhTAQXZfKHKbaH4b3aLFOLtsBW', '2026-01-29 12:14:00'),
(25, 'kerlek', 'kerlek@gmail.com', 'kerlek', '$2b$10$mCwE0rmvVufcvR/zcSA.H.g4ogx15CWEhAcfpldRWsgIkxNKNSaCS', '2026-02-15 15:10:53');

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
(1, 'laednf', 'joskit208@hengersor.hu', 'gvjdf', '2026-02-15 11:59:31');

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
-- A tábla indexei `ajanlo`
--
ALTER TABLE `ajanlo`
  ADD PRIMARY KEY (`ajanlo_id`),
  ADD KEY `kerdesek_valaszai_ID` (`kerdesek_valaszai_ID`,`ajanlott_kepzes(kepzes id-ja))`),
  ADD KEY `ajanlott_kepzes(kepzes id-ja))` (`ajanlott_kepzes(kepzes id-ja))`);

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
-- AUTO_INCREMENT a táblához `ajanlo`
--
ALTER TABLE `ajanlo`
  MODIFY `ajanlo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `jelentkezesek`
--
ALTER TABLE `jelentkezesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `kepzesek`
--
ALTER TABLE `kepzesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT a táblához `user_ado`
--
ALTER TABLE `user_ado`
  MODIFY `ua_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `user_vevo`
--
ALTER TABLE `user_vevo`
  MODIFY `uv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT a táblához `uzenetek`
--
ALTER TABLE `uzenetek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `vegzettseg`
--
ALTER TABLE `vegzettseg`
  MODIFY `id_veg` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `ajanlo`
--
ALTER TABLE `ajanlo`
  ADD CONSTRAINT `ajanlo_ibfk_2` FOREIGN KEY (`ajanlott_kepzes(kepzes id-ja))`) REFERENCES `kepzesek` (`id`);

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
