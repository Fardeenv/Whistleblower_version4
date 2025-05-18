package Whistleblower;
import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import java.util.Objects;
import java.util.ArrayList;
import java.util.List;

@DataType
public class Whistleblower {
    @Property
    private final String id;

    @Property
    private final String title;

    @Property
    private final String description;

    @Property
    private final String submitter;

    @Property
    private final String date;

    @Property
    private final String status;

    @Property
    private final int criticality;

    @Property
    private final String rewardWallet;

    @Property
    private final String assignedTo;

    @Property
    private final String assignedToName;

    @Property
    private final List<ChatMessage> chatHistory;

    @Property
    private final String voiceNote;

    @Property
    private final boolean hasVoiceNote;

    @Property
    private final String department;

    @Property
    private final String location;

    @Property
    private final String monetaryValue;

    @Property
    private final String relationship;

    @Property
    private final String encounter;

    @Property
    private final boolean authoritiesAware;

    @Property
    private final String managementSummary;

    @Property
    private final List<String> previousInvestigators;

    @Property
    private final List<String> reopenReasons;

    @Property
    private final boolean isReopened;

    @Property
    private final String closureSummary;

    @Property
    private final boolean permanentlyClosed;

    @Property
    private final String rewardNote;

    @Property
    private final double rewardAmount;

    @Property
    private final boolean rewardProcessed;
    
    // New fields for file attachments
    @Property
    private final List<FileAttachment> attachments;
    
    @Property
    private final String voiceToText;

    public Whistleblower(
            @JsonProperty("id") final String id,
            @JsonProperty("title") final String title,
            @JsonProperty("description") final String description,
            @JsonProperty("submitter") final String submitter,
            @JsonProperty("date") final String date,
            @JsonProperty("status") final String status,
            @JsonProperty("criticality") final int criticality,
            @JsonProperty("rewardWallet") final String rewardWallet,
            @JsonProperty("assignedTo") final String assignedTo,
            @JsonProperty("assignedToName") final String assignedToName,
            @JsonProperty("chatHistory") final List<ChatMessage> chatHistory,
            @JsonProperty("voiceNote") final String voiceNote,
            @JsonProperty("hasVoiceNote") final boolean hasVoiceNote,
            @JsonProperty("department") final String department,
            @JsonProperty("location") final String location,
            @JsonProperty("monetaryValue") final String monetaryValue,
            @JsonProperty("relationship") final String relationship,
            @JsonProperty("encounter") final String encounter,
            @JsonProperty("authoritiesAware") final boolean authoritiesAware,
            @JsonProperty("managementSummary") final String managementSummary,
            @JsonProperty("previousInvestigators") final List<String> previousInvestigators,
            @JsonProperty("reopenReasons") final List<String> reopenReasons,
            @JsonProperty("isReopened") final boolean isReopened,
            @JsonProperty("closureSummary") final String closureSummary,
            @JsonProperty("permanentlyClosed") final boolean permanentlyClosed,
            @JsonProperty("rewardNote") final String rewardNote,
            @JsonProperty("rewardAmount") final double rewardAmount,
            @JsonProperty("rewardProcessed") final boolean rewardProcessed,
            @JsonProperty("attachments") final List<FileAttachment> attachments,
            @JsonProperty("voiceToText") final String voiceToText) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.submitter = submitter;
        this.date = date;
        this.status = status;
        this.criticality = criticality;
        this.rewardWallet = rewardWallet;
        this.assignedTo = assignedTo;
        this.assignedToName = assignedToName;
        this.chatHistory = chatHistory != null ? chatHistory : new ArrayList<>();
        this.voiceNote = voiceNote;
        this.hasVoiceNote = hasVoiceNote;
        this.department = department;
        this.location = location;
        this.monetaryValue = monetaryValue;
        this.relationship = relationship;
        this.encounter = encounter;
        this.authoritiesAware = authoritiesAware;
        this.managementSummary = managementSummary;
        this.previousInvestigators = previousInvestigators != null ? previousInvestigators : new ArrayList<>();
        this.reopenReasons = reopenReasons != null ? reopenReasons : new ArrayList<>();
        this.isReopened = isReopened;
        this.closureSummary = closureSummary;
        this.permanentlyClosed = permanentlyClosed;
        this.rewardNote = rewardNote;
        this.rewardAmount = rewardAmount;
        this.rewardProcessed = rewardProcessed;
        this.attachments = attachments != null ? attachments : new ArrayList<>();
        this.voiceToText = voiceToText;
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSubmitter() { return submitter; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
    public int getCriticality() { return criticality; }
    public String getRewardWallet() { return rewardWallet; }
    public String getAssignedTo() { return assignedTo; }
    public String getAssignedToName() { return assignedToName; }
    public List<ChatMessage> getChatHistory() { return chatHistory; }
    public String getVoiceNote() { return voiceNote; }
    public boolean getHasVoiceNote() { return hasVoiceNote; }
    public String getDepartment() { return department; }
    public String getLocation() { return location; }
    public String getMonetaryValue() { return monetaryValue; }
    public String getRelationship() { return relationship; }
    public String getEncounter() { return encounter; }
    public boolean getAuthoritiesAware() { return authoritiesAware; }
    public String getManagementSummary() { return managementSummary; }
    public List<String> getPreviousInvestigators() { return previousInvestigators; }
    public List<String> getReopenReasons() { return reopenReasons; }
    public boolean getIsReopened() { return isReopened; }
    public String getClosureSummary() { return closureSummary; }
    public boolean getPermanentlyClosed() { return permanentlyClosed; }
    public String getRewardNote() { return rewardNote; }
    public double getRewardAmount() { return rewardAmount; }
    public boolean getRewardProcessed() { return rewardProcessed; }
    public List<FileAttachment> getAttachments() { return attachments; }
    public String getVoiceToText() { return voiceToText; }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Whistleblower other = (Whistleblower) obj;
        return Objects.equals(id, other.id) &&
               Objects.equals(title, other.title) &&
               Objects.equals(description, other.description) &&
               Objects.equals(submitter, other.submitter) &&
               Objects.equals(date, other.date) &&
               Objects.equals(status, other.status) &&
               criticality == other.criticality &&
               Objects.equals(rewardWallet, other.rewardWallet) &&
               Objects.equals(assignedTo, other.assignedTo) &&
               Objects.equals(assignedToName, other.assignedToName) &&
               Objects.equals(chatHistory, other.chatHistory) &&
               Objects.equals(voiceNote, other.voiceNote) &&
               hasVoiceNote == other.hasVoiceNote &&
               Objects.equals(department, other.department) &&
               Objects.equals(location, other.location) &&
               Objects.equals(monetaryValue, other.monetaryValue) &&
               Objects.equals(relationship, other.relationship) &&
               Objects.equals(encounter, other.encounter) &&
               authoritiesAware == other.authoritiesAware &&
               Objects.equals(managementSummary, other.managementSummary) &&
               Objects.equals(previousInvestigators, other.previousInvestigators) &&
               Objects.equals(reopenReasons, other.reopenReasons) &&
               isReopened == other.isReopened &&
               Objects.equals(closureSummary, other.closureSummary) &&
               permanentlyClosed == other.permanentlyClosed &&
               Objects.equals(rewardNote, other.rewardNote) &&
               rewardAmount == other.rewardAmount &&
               rewardProcessed == other.rewardProcessed &&
               Objects.equals(attachments, other.attachments) &&
               Objects.equals(voiceToText, other.voiceToText);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, submitter, date, status,
                          criticality, rewardWallet, assignedTo, assignedToName, chatHistory,
                          voiceNote, hasVoiceNote, department, location,
                          monetaryValue, relationship, encounter, authoritiesAware,
                          managementSummary, previousInvestigators, reopenReasons, isReopened,
                          closureSummary, permanentlyClosed, rewardNote, rewardAmount, rewardProcessed,
                          attachments, voiceToText);
    }

    @Override
    public String toString() {
        return String.format("Whistleblower [id=%s, title=%s, submitter=%s, date=%s, status=%s, criticality=%d, hasVoiceNote=%b, isReopened=%b, permanentlyClosed=%b]",
                           id, title, submitter, date, status, criticality, hasVoiceNote, isReopened, permanentlyClosed);
    }
}
