package Whistleblower;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import com.owlike.genson.Genson;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Contract(
    name = "Whistleblower",
    info = @Info(
        title = "Whistleblower Contract",
        description = "A whistleblower reporting system on blockchain",
        version = "2.0"
    )
)
@Default
public class WhistleblowerContract implements ContractInterface {
    private final Genson genson = new Genson();
    
    private enum WhistleblowerErrors {
        REPORT_NOT_FOUND,
        REPORT_ALREADY_EXISTS,
        INVALID_ACCESS,
        INVALID_STATUS_CHANGE,
        INVESTIGATOR_NOT_ASSIGNED
    }
    
    @Transaction()
    public void initLedger(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        
        List<ChatMessage> chatHistory = new ArrayList<>();
        Whistleblower report = new Whistleblower(
            "1", 
            "Sample Report", 
            "This is a sample whistleblower report for initialization", 
            "anonymous", 
            "2025-04-13", 
            "pending",
            3, // medium criticality
            "", // no reward wallet
            "", // not assigned
            chatHistory
        );
        
        String reportState = genson.serialize(report);
        stub.putStringState("1", reportState);
        System.out.println("Ledger Initialized with default whistleblower report.");
    }
    
    @Transaction()
    public Whistleblower submitReport(
            final Context ctx, 
            final String id, 
            final String title, 
            final String description, 
            final String submitter, 
            final String date,
            final int criticality,
            final String rewardWallet) {
        
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(id);
        
        if (!reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s already exists", id);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_ALREADY_EXISTS.toString());
        }
        
        List<ChatMessage> chatHistory = new ArrayList<>();
        Whistleblower report = new Whistleblower(
            id, 
            title, 
            description, 
            submitter, 
            date, 
            "pending",
            criticality,
            rewardWallet,
            "", // not assigned yet
            chatHistory
        );
        
        reportState = genson.serialize(report);
        stub.putStringState(id, reportState);
        System.out.println("Report submitted: " + report.toString());
        
        return report;
    }
    
    @Transaction()
    public Whistleblower queryReportById(final Context ctx, final String id) {
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(id);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", id);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower report = genson.deserialize(reportState, Whistleblower.class);
        System.out.println("Report retrieved: " + report.toString());
        
        return report;
    }
    
    @Transaction()
    public Whistleblower assignReport(final Context ctx, final String id, final String investigatorId) {
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(id);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", id);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower oldReport = genson.deserialize(reportState, Whistleblower.class);
        
        // Create a new report with updated assignment and status
        Whistleblower newReport = new Whistleblower(
            oldReport.getId(),
            oldReport.getTitle(),
            oldReport.getDescription(),
            oldReport.getSubmitter(),
            oldReport.getDate(),
            "under_investigation", // Automatically change status to under investigation
            oldReport.getCriticality(),
            oldReport.getRewardWallet(),
            investigatorId, // Assign the investigator
            oldReport.getChatHistory()
        );
        
        String newReportState = genson.serialize(newReport);
        stub.putStringState(id, newReportState);
        System.out.println("Report assigned to investigator: " + newReport.toString());
        
        return newReport;
    }
    
    @Transaction()
    public Whistleblower updateReportStatus(final Context ctx, final String id, final String newStatus) {
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(id);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", id);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower oldReport = genson.deserialize(reportState, Whistleblower.class);
        
        // Create a new report with updated status
        Whistleblower newReport = new Whistleblower(
            oldReport.getId(),
            oldReport.getTitle(),
            oldReport.getDescription(),
            oldReport.getSubmitter(),
            oldReport.getDate(),
            newStatus,
            oldReport.getCriticality(),
            oldReport.getRewardWallet(),
            oldReport.getAssignedTo(),
            oldReport.getChatHistory()
        );
        
        String newReportState = genson.serialize(newReport);
        stub.putStringState(id, newReportState);
        System.out.println("Report status updated: " + newReport.toString());
        
        return newReport;
    }
    
    @Transaction()
    public Whistleblower addChatMessage(
            final Context ctx, 
            final String reportId, 
            final String sender, 
            final String content, 
            final String timestamp) {
        
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(reportId);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", reportId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower report = genson.deserialize(reportState, Whistleblower.class);
        
        // Add a new chat message
        List<ChatMessage> chatHistory = new ArrayList<>(report.getChatHistory());
        ChatMessage newMessage = new ChatMessage(sender, content, timestamp, false);
        chatHistory.add(newMessage);
        
        // Create an updated report with the new chat message
        Whistleblower updatedReport = new Whistleblower(
            report.getId(),
            report.getTitle(),
            report.getDescription(),
            report.getSubmitter(),
            report.getDate(),
            report.getStatus(),
            report.getCriticality(),
            report.getRewardWallet(),
            report.getAssignedTo(),
            chatHistory
        );
        
        String updatedReportState = genson.serialize(updatedReport);
        stub.putStringState(reportId, updatedReportState);
        System.out.println("Chat message added to report: " + updatedReport.getId());
        
        return updatedReport;
    }
    
    @Transaction()
    public Whistleblower markChatMessagesAsRead(final Context ctx, final String reportId, final String reader) {
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(reportId);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", reportId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower report = genson.deserialize(reportState, Whistleblower.class);
        
        // Mark messages as read
        List<ChatMessage> updatedChatHistory = new ArrayList<>();
        
        for (ChatMessage msg : report.getChatHistory()) {
            // Mark message as read if it's not from the reader
            boolean isRead = msg.getIsRead() || !msg.getSender().equals(reader);
            
            ChatMessage updatedMsg = new ChatMessage(
                msg.getSender(),
                msg.getContent(),
                msg.getTimestamp(),
                isRead
            );
            
            updatedChatHistory.add(updatedMsg);
        }
        
        // Create an updated report with the messages marked as read
        Whistleblower updatedReport = new Whistleblower(
            report.getId(),
            report.getTitle(),
            report.getDescription(),
            report.getSubmitter(),
            report.getDate(),
            report.getStatus(),
            report.getCriticality(),
            report.getRewardWallet(),
            report.getAssignedTo(),
            updatedChatHistory
        );
        
        String updatedReportState = genson.serialize(updatedReport);
        stub.putStringState(reportId, updatedReportState);
        System.out.println("Chat messages marked as read in report: " + updatedReport.getId());
        
        return updatedReport;
    }
    
    @Transaction()
    public Whistleblower completeInvestigation(final Context ctx, final String reportId, final String investigatorId) {
        ChaincodeStub stub = ctx.getStub();
        String reportState = stub.getStringState(reportId);
        
        if (reportState.isEmpty()) {
            String errorMessage = String.format("Report with ID %s does not exist", reportId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.REPORT_NOT_FOUND.toString());
        }
        
        Whistleblower report = genson.deserialize(reportState, Whistleblower.class);
        
        // Verify that the investigator is assigned to this report
        if (!report.getAssignedTo().equals(investigatorId)) {
            String errorMessage = String.format("Investigator %s is not assigned to report %s", investigatorId, reportId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.INVESTIGATOR_NOT_ASSIGNED.toString());
        }
        
        // Verify that the report is under investigation
        if (!report.getStatus().equals("under_investigation")) {
            String errorMessage = String.format("Report %s is not under investigation", reportId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, WhistleblowerErrors.INVALID_STATUS_CHANGE.toString());
        }
        
        // Create an updated report with completed status
        Whistleblower updatedReport = new Whistleblower(
            report.getId(),
            report.getTitle(),
            report.getDescription(),
            report.getSubmitter(),
            report.getDate(),
            "completed",
            report.getCriticality(),
            report.getRewardWallet(),
            report.getAssignedTo(),
            report.getChatHistory()
        );
        
        String updatedReportState = genson.serialize(updatedReport);
        stub.putStringState(reportId, updatedReportState);
        System.out.println("Investigation completed for report: " + updatedReport.getId());
        
        return updatedReport;
    }
    
    @Transaction()
    public String getAllReports(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        return stub.getStateByRange("", "").toString();
    }
    
    @Transaction()
    public String getReportsByStatus(final Context ctx, final String status) {
        ChaincodeStub stub = ctx.getStub();
        
        List<Whistleblower> filteredReports = new ArrayList<>();
        Map<String, String> queryResults = new HashMap<>();
        
        // Get all reports
        stub.getStateByRange("", "").forEach(queryResult -> {
            String key = queryResult.getKey();
            String value = queryResult.getStringValue();
            queryResults.put(key, value);
        });
        
        // Filter by status
        for (Map.Entry<String, String> entry : queryResults.entrySet()) {
            try {
                Whistleblower report = genson.deserialize(entry.getValue(), Whistleblower.class);
                if (report.getStatus().equals(status)) {
                    filteredReports.add(report);
                }
            } catch (Exception e) {
                System.out.println("Error deserializing report: " + e.getMessage());
            }
        }
        
        // Sort by criticality (high to low)
        filteredReports.sort((a, b) -> Integer.compare(b.getCriticality(), a.getCriticality()));
        
        return genson.serialize(filteredReports);
    }
    
    @Transaction()
    public String getReportsByInvestigator(final Context ctx, final String investigatorId) {
        ChaincodeStub stub = ctx.getStub();
        
        List<Whistleblower> filteredReports = new ArrayList<>();
        Map<String, String> queryResults = new HashMap<>();
        
        // Get all reports
        stub.getStateByRange("", "").forEach(queryResult -> {
            String key = queryResult.getKey();
            String value = queryResult.getStringValue();
            queryResults.put(key, value);
        });
        
        // Filter by investigator
        for (Map.Entry<String, String> entry : queryResults.entrySet()) {
            try {
                Whistleblower report = genson.deserialize(entry.getValue(), Whistleblower.class);
                if (report.getAssignedTo().equals(investigatorId)) {
                    filteredReports.add(report);
                }
            } catch (Exception e) {
                System.out.println("Error deserializing report: " + e.getMessage());
            }
        }
        
        return genson.serialize(filteredReports);
    }
    
    @Transaction()
    public String getUnassignedReports(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        
        List<Whistleblower> filteredReports = new ArrayList<>();
        Map<String, String> queryResults = new HashMap<>();
        
        // Get all reports
        stub.getStateByRange("", "").forEach(queryResult -> {
            String key = queryResult.getKey();
            String value = queryResult.getStringValue();
            queryResults.put(key, value);
        });
        
        // Filter unassigned reports
        for (Map.Entry<String, String> entry : queryResults.entrySet()) {
            try {
                Whistleblower report = genson.deserialize(entry.getValue(), Whistleblower.class);
                if (report.getAssignedTo() == null || report.getAssignedTo().isEmpty()) {
                    filteredReports.add(report);
                }
            } catch (Exception e) {
                System.out.println("Error deserializing report: " + e.getMessage());
            }
        }
        
        // Sort by criticality (high to low)
        filteredReports.sort((a, b) -> Integer.compare(b.getCriticality(), a.getCriticality()));
        
        return genson.serialize(filteredReports);
    }
}