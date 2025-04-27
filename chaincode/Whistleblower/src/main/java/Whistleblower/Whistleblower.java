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
    private final int criticality; // 1-5 scale (5 = most critical)
    
    @Property
    private final String rewardWallet; // Crypto wallet address for rewards
    
    @Property
    private final String assignedTo; // Investigator ID assigned to this report
    
    @Property
    private final List<ChatMessage> chatHistory; // Chat history between whistleblower and investigator
    
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
            @JsonProperty("chatHistory") final List<ChatMessage> chatHistory) {
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
               Objects.equals(chatHistory, other.chatHistory);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, submitter, date, status, 
                          criticality, rewardWallet, assignedTo, chatHistory);
    }
    
    @Override
    public String toString() {
        return String.format("Whistleblower [id=%s, title=%s, submitter=%s, date=%s, status=%s, criticality=%d]", 
                           id, title, submitter, date, status, criticality);
    }
}