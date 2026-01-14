-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Jan 14. 13:01
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
-- Tábla szerkezet ehhez a táblához `jelentkezes`
--

CREATE TABLE `jelentkezes` (
  `f_nev` varchar(45) DEFAULT NULL,
  `gmail` varchar(45) DEFAULT NULL,
  `kor` varchar(45) DEFAULT NULL,
  `kepzes_ID` int(11) DEFAULT NULL,
  `uv_j_ID` int(11) DEFAULT NULL,
  `j_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

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
  `jelentkezes_ID` int(11) DEFAULT NULL,
  `ár` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kepzesek`
--

INSERT INTO `kepzesek` (`id`, `kep`, `nev`, `leiras`, `helyileg`, `email`, `o_nev`, `heves_kortol`, `uv_ID`, `ua_ID`, `jelentkezes_ID`, `ár`) VALUES
(27, '../tanfolyamok/kepek/körms.jpg', 'Körmös Tanfolyam', 'Műköröm építés alap és haladó technikákkal.', 'Budapest', 'info@szepseg.hu', 'Kiss Anna', 16, NULL, NULL, NULL, 0),
(28, '../Tanfolyamok/kepek/gellakk.jpg', 'Géllakk Tanfolyam', 'Tartós géllakk technikák kezdőknek.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 16, NULL, NULL, NULL, 0),
(29, '../Tanfolyamok/kepek/muszepillaepites.jpg', 'Műszempilla Építő Tanfolyam', '1D–2D szempilla építés gyakorlattal.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, NULL, 0),
(30, '../Tanfolyamok/kepek/lifting.jpg', 'Pillalifting Tanfolyam', 'Természetes pillalifting technikák.', 'Budapest', 'info@szepseg.hu', 'Tóth Petra', 18, NULL, NULL, NULL, 0),
(31, '../Tanfolyamok/kepek/laminalas.jpg', 'Szemöldök Laminálás', 'Szemöldök formázás és laminálás.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, NULL, 0),
(32, '../Tanfolyamok/kepek/alapsmink.jpg', 'Sminkes Alap Tanfolyam', 'Nappali és alkalmi sminkek készítése.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 16, NULL, NULL, NULL, 0),
(33, '../Tanfolyamok/kepek/manikur.jpg', 'Manikűr Tanfolyam', 'Alap és dekorációs manikűr technikák.', 'Budapest', 'info@szepseg.hu', 'Kiss Petra', 16, NULL, NULL, NULL, 0),
(34, '../Tanfolyamok/kepek/pedikur.jpg', 'Pedikűr Haladó Tanfolyam', 'Speciális pedikűr technikák és spa kezelések.', 'Budapest', 'info@szepseg.hu', 'Nagy Lilla', 18, NULL, NULL, NULL, 0),
(35, '../Tanfolyamok/kepek/fodrasz.jpg', 'Fodrász Haladó Tanfolyam', 'Haladó vágás, festés és hajformázás.', 'Budapest', 'info@szepseg.hu', 'Kovács Anna', 18, NULL, NULL, NULL, 0),
(36, '../Tanfolyamok/kepek/extrasmink.jpg', 'Smink Profi Tanfolyam', 'Professzionális smink technikák, modellekre.', 'Budapest', 'info@szepseg.hu', 'Horváth Nóra', 18, NULL, NULL, NULL, 0),
(37, '../Tanfolyamok/kepek/skin.jpg', 'Arcpakolás és Bőrápolás', 'Személyre szabott arcpakolások és kezelések.', 'Budapest', 'info@szepseg.hu', 'Szabó Réka', 18, NULL, NULL, NULL, 0),
(39, '../Tanfolyamok/kepek/műszempiilas.jpg', 'Szempilla Haladó Tanfolyam', 'Volume és hybrid szempilla építés.', 'Budapest', 'info@szepseg.hu', 'Szabó Lilla', 18, NULL, NULL, NULL, 0),
(40, '../Tanfolyamok/kepek/haladoszemoldok.jpg', 'Szemöldök Laminálás Haladó', 'Haladó laminálás és formázás technikák.', 'Budapest', 'info@szepseg.hu', 'Kovács Dóra', 18, NULL, NULL, NULL, 0),
(41, '../Tanfolyamok/kepek/gellakhalado.jpg', 'Géllakk Haladó Tanfolyam', 'Komplex minták és díszítések géllakkal.', 'Budapest', 'info@szepseg.hu', 'Nagy Eszter', 18, NULL, NULL, NULL, 0),
(42, '../Tanfolyamok/kepek/barber.jpg', 'Barber / Férfi Fodrász Tanfolyam', 'Borotválás, férfi hajvágás és styling.', 'Budapest', 'info@szepseg.hu', 'Kovács Péter', 18, NULL, NULL, NULL, 0),
(43, '../Tanfolyamok/kepek/busniess.jpg', 'Szalonindítás Alapok', 'Szépségipari vállalkozás indítása.', 'Online', 'info@szepseg.hu', 'Vincze Péter', 18, NULL, NULL, NULL, 0),
(44, '../Tanfolyamok/kepek/asztalossjpg.jpg', 'Asztalos Mesterkurzus', 'Alap- és haladó asztalos technikák.', 'Offline', 'info@asztalos.hu', 'Kovács László', 24, NULL, NULL, NULL, 0),
(45, '../Tanfolyamok/kepek/autoszzerelo.jpg', 'Autószerelő Alapok', 'Gépjárművek karbantartása és javítása.', 'Offline', 'info@autoszerelo.hu', 'Nagy István', 40, NULL, NULL, NULL, 0),
(46, '../Tanfolyamok/kepek/cukrasz.jpg', 'Cukrász Tanfolyam', 'Torták, sütemények és desszertek készítése.', 'Online', 'info@cukrasz.hu', 'Tóth Anna', 30, NULL, NULL, NULL, 0),
(47, '../Tanfolyamok/kepek/heggeszto.jpg', 'Hegesztő Alapok', 'Különböző hegesztési technikák gyakorlati okt', 'Offline', 'info@hegeszto.hu', 'Farkas Péter', 36, NULL, NULL, NULL, 0),
(48, '../Tanfolyamok/kepek/masszazs.jpg', 'Masszőr Tanfolyam', 'Relaxációs és terápiás masszázs technikák.', 'Online', 'info@masszazs.hu', 'Horváth Judit', 20, NULL, NULL, NULL, 0),
(49, '../Tanfolyamok/kepek/rogramozo.jpg', 'Programozó Alapok', 'Programozás alapjai és gyakorlati projektek.', 'Online', 'info@programozas.hu', 'Szabó Gábor', 50, NULL, NULL, NULL, 0),
(50, '../Tanfolyamok/kepek/szakaccs.jpg', 'Szakács Tanfolyam', 'Ételkészítés és konyhai technikák.', 'Offline', 'info@szakacs.hu', 'Balogh Erika', 45, NULL, NULL, NULL, 0),
(51, '../Tanfolyamok/kepek/vezetes.jpg', 'Vezetési Tanfolyam', 'Biztonságos és hatékony vezetési gyakorlat.', 'Offline', 'info@vezetes.hu', 'Molnár Péter', 25, NULL, NULL, NULL, 0),
(52, '../Tanfolyamok/kepek/villanyszzerelo.jpg', 'Villanyszerelő Alapok', 'Elektromos rendszerek telepítése és karbantar', 'Offline', 'info@villany.hu', 'Kiss András', 40, NULL, NULL, NULL, 0),
(53, '../Tanfolyamok/kepek/festo.jpg', 'Festő Tanfolyam', 'Beltéri és kültéri festési technikák.', 'Offline', 'info@festo.hu', 'Németh Ágnes', 28, NULL, NULL, NULL, 0),
(54, '../Tanfolyamok/kepek/tetofedo.jpg', 'Tetőfedő Tanfolyam', 'Tetőfedés és javítás alapjai.', 'Offline', 'info@tetkos.hu', 'Pál Gábor', 35, NULL, NULL, NULL, 0),
(55, '../Tanfolyamok/kepek/klima.jpg', 'Klímaszerelő Alapok', 'Légkondicionáló rendszerek telepítése és karb', 'Offline', 'info@klima.hu', 'Varga Attila', 32, NULL, NULL, NULL, 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_ado`
--

INSERT INTO `user_ado` (`ua_id`, `felhasznalonev`, `jelszo`, `gmail`, `vegzettseg`) VALUES
(6, 'test', '$2b$10$hikKbk20b2uMYAJkzqVDduDR0jW6Yy.27Kb/j3rVG1v6pNvVQy0WO', 'test@gmail.com', 'egyetem');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_vevo`
--

INSERT INTO `user_vevo` (`uv_id`, `nev`, `email`, `felhasznalonev`, `jelszo`, `regisztracio_datum`) VALUES
(12, 'aha', 'aha@gmai.com', 'aha', '$2b$10$3ZxRAvLgQYhww2d7JLjQP.AgoncSn7fGtoJ2YEaYe6ibaz61pAuLq', '2026-01-14 09:25:05'),
(13, 'valaki', 'valaki@gmail.com', 'valaki', '$2b$10$nd3Vhm7eUgsP/g5mS/jxReUCfsqrzXmnFdluQ0l26bM8iDSjSYt06', '2026-01-14 09:30:29');

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
-- A tábla indexei `jelentkezes`
--
ALTER TABLE `jelentkezes`
  ADD PRIMARY KEY (`j_ID`),
  ADD KEY `j_ID` (`kepzes_ID`,`uv_j_ID`),
  ADD KEY `uv_j_ID` (`uv_j_ID`);

--
-- A tábla indexei `kepzesek`
--
ALTER TABLE `kepzesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uv_ID` (`uv_ID`,`ua_ID`),
  ADD KEY `ua_ID` (`ua_ID`),
  ADD KEY `jelentkezes_ID` (`jelentkezes_ID`);

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
-- AUTO_INCREMENT a táblához `jelentkezes`
--
ALTER TABLE `jelentkezes`
  MODIFY `j_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kepzesek`
--
ALTER TABLE `kepzesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT a táblához `user_ado`
--
ALTER TABLE `user_ado`
  MODIFY `ua_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `user_vevo`
--
ALTER TABLE `user_vevo`
  MODIFY `uv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
-- Megkötések a táblához `jelentkezes`
--
ALTER TABLE `jelentkezes`
  ADD CONSTRAINT `jelentkezes_ibfk_1` FOREIGN KEY (`uv_j_ID`) REFERENCES `user_vevo` (`uv_id`);

--
-- Megkötések a táblához `kepzesek`
--
ALTER TABLE `kepzesek`
  ADD CONSTRAINT `kepzesek_ibfk_1` FOREIGN KEY (`ua_ID`) REFERENCES `user_ado` (`ua_id`),
  ADD CONSTRAINT `kepzesek_ibfk_2` FOREIGN KEY (`uv_ID`) REFERENCES `user_vevo` (`uv_id`),
  ADD CONSTRAINT `kepzesek_ibfk_3` FOREIGN KEY (`jelentkezes_ID`) REFERENCES `jelentkezes` (`j_ID`);

--
-- Megkötések a táblához `vegzettseg`
--
ALTER TABLE `vegzettseg`
  ADD CONSTRAINT `vegzettseg_ibfk_1` FOREIGN KEY (`uv_idegenID`) REFERENCES `user_vevo` (`uv_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
