package com.hhd1337.jatuli_quiz.domain.defense.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "defense_queue_entry",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_defense_queue_entry_folder_id",
                        columnNames = "folder_id"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DefenseQueueEntry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "defense_queue_entry_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @Column(name = "queue_order", nullable = false)
    private Integer queueOrder;

    private DefenseQueueEntry(Folder folder, Integer queueOrder) {
        this.folder = folder;
        this.queueOrder = queueOrder;
    }

    public static DefenseQueueEntry create(Folder folder, Integer queueOrder) {
        return new DefenseQueueEntry(folder, queueOrder);
    }

    public void changeQueueOrder(Integer queueOrder) {
        this.queueOrder = queueOrder;
    }
}
