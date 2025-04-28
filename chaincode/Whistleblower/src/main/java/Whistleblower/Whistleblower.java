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
            @JsonProperty("chatHistory") final List<ChatMessage> chatHistory,
            @JsonProperty("voiceNote") final String voiceNote,
            @JsonProperty("hasVoiceNote") final boolean hasVoiceNote,
            @JsonProperty("department") final String department,
            @JsonProperty("location") final String location,
            @JsonProperty("monetaryValue") final String monetaryValue,
            @JsonProperty("relationship") final String relationship,
            @JsonProperty("encounter") final String encounter,
            @JsonProperty("authoritiesAware") final boolean authoritiesAware) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.submitter = submitter;
        this.date = date;
        this.status = status;
        this.criticality = criticality;
        this.rewardWallet = rewardWallet;
        this.assignedTo = assignedTo;
        this.chatHistory = chatHistory != null ? chatHistory : new ArrayList<>();
        this.voiceNote = voiceNote;
        this.hasVoiceNote = hasVoiceNote;
        this.department = department;
        this.location = location;
        this.monetaryValue = monetaryValue;
        this.relationship = relationship;
        this.encounter = encounter;
        this.authoritiesAware = authoritiesAware;
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
    public List<ChatMessage> getChatHistory() { return chatHistory; }
    public String getVoiceNote() { return voiceNote; }
    public boolean getHasVoiceNote() { return hasVoiceNote; }
    public String getDepartment() { return department; }
    public String getLocation() { return location; }
    public String getMonetaryValue() { return monetaryValue; }
    public String getRelationship() { return relationship; }
    public String getEncounter() { return encounter; }
    public boolean getAuthoritiesAware() { return authoritiesAware; }
    
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
               Objects.equals(chatHistory, other.chatHistory) &&
               Objects.equals(voiceNote, other.voiceNote) &&
               hasVoiceNote == other.hasVoiceNote &&
               Objects.equals(department, other.department) &&
               Objects.equals(location, other.location) &&
               Objects.equals(monetaryValue, other.monetaryValue) &&
               Objects.equals(relationship, other.relationship) &&
               Objects.equals(encounter, other.encounter) &&
               authoritiesAware == other.authoritiesAware;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, submitter, date, status, 
                          criticality, rewardWallet, assignedTo, chatHistory,
                          voiceNote, hasVoiceNote, department, location,
                          monetaryValue, relationship, encounter, authoritiesAware);
    }
    
    @Override
    public String toString() {
        return String.format("Whistleblower [id=%s, title=%s, submitter=%s, date=%s, status=%s, criticality=%d, hasVoiceNote=%b]", 
                           id, title, submitter, date, status, criticality, hasVoiceNote);
    }
}