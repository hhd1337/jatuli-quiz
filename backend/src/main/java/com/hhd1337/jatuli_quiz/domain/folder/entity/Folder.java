package com.hhd1337.jatuli_quiz.domain.folder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "folder")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "folder_id")
    private Long folderId;

    @Column(name = "full_path", length = 500)
    private String fullPath;

    @Column(name = "depth")
    private Integer depth;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "problem_count")
    private Integer problemCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private Folder parentFolder;

    public Folder(
            String fullPath,
            Integer depth,
            String name,
            Integer problemCount,
            Folder parentFolder
    ) {
        this.fullPath = fullPath;
        this.depth = depth;
        this.name = name;
        this.problemCount = problemCount;
        this.parentFolder = parentFolder;
    }
}