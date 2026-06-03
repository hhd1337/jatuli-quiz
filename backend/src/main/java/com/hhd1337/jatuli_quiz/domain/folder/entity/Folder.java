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

    @Column(name = "sort_order")
    private Integer sortOrder;

    public Folder(
            String fullPath,
            Integer depth,
            String name,
            Integer problemCount,
            Folder parentFolder,
            Integer sortOrder
    ) {
        this.fullPath = fullPath;
        this.depth = depth;
        this.name = name;
        this.problemCount = problemCount;
        this.parentFolder = parentFolder;
        this.sortOrder = sortOrder;
    }

    public static Folder createChildFolder(
            String name,
            Folder parentFolder,
            Integer sortOrder
    ) {
        return new Folder(
                buildFullPath(parentFolder, name),
                parentFolder.getDepth() + 1,
                name,
                0,
                parentFolder,
                sortOrder
        );
    }

    private static String buildFullPath(Folder parentFolder, String name) {
        String parentFullPath = parentFolder.getFullPath();

        if (parentFullPath == null || parentFullPath.isBlank() || parentFullPath.equals("/")) {
            return "/" + name;
        }

        return parentFullPath + "/" + name;
    }

    public void increaseProblemCount(int count) {
        if (this.problemCount == null) {
            this.problemCount = 0;
        }
        this.problemCount += count;
    }

    public void rename(String name) {
        this.name = name;
        this.fullPath = buildFullPath(this.parentFolder, name);
    }

    public void refreshFullPath() {
        this.fullPath = buildFullPath(this.parentFolder, this.name);
    }

    public void changeSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isRoot() {
        return this.parentFolder == null;
    }
}