CREATE TABLE issues (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(100) NOT NULL,
description TEXT NOT NULL,
created_by VARCHAR(100) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT now(),
updated_by VARCHAR(100),
updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE `issue_revisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `revision_no` int NOT NULL,
  `changes` json NOT NULL,
  `updated_by` varchar(255) DEFAULT 'unknown',
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `issue_id` (`issue_id`),
  CONSTRAINT `issue_revisions_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);