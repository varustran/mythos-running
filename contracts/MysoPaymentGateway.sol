// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MysoPaymentGateway
 * @author Myso Architecture Team
 * @notice Global Web2.5 Safe-by-Design Payment Gateway for Myso.
 * Implements strict one-way value ingestion, 85/15 creator payout split,
 * and transparent on-chain event emission for post unlock verification.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MysoPaymentGateway {
    address public immutable owner;
    address public treasury;

    // Supported Settlement Currencies (USDT, USDC)
    mapping(address => bool) public supportedTokens;

    // Platform Fee Split (85% to Creator, 15% to Platform Treasury)
    uint256 public constant CREATOR_SHARE_BPS = 8500; // 85.00%
    uint256 public constant PLATFORM_FEE_BPS = 1500;  // 15.00%
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Events
    event TokenWhitelisted(address indexed token, bool enabled);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    event GoldPurchased(
        address indexed buyer,
        address indexed token,
        uint256 amountPaid,
        uint256 goldGranted,
        uint256 timestamp
    );

    event PostUnlocked(
        bytes32 indexed postId,
        address indexed buyer,
        address indexed creator,
        address token,
        uint256 totalAmount,
        uint256 creatorShare,
        uint256 platformFee,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Myso: Caller is not owner");
        _;
    }

    constructor(address _treasury) {
        require(_treasury != address(0), "Myso: Invalid treasury address");
        owner = msg.sender;
        treasury = _treasury;
    }

    function setTokenSupport(address token, bool enabled) external onlyOwner {
        require(token != address(0), "Myso: Invalid token");
        supportedTokens[token] = enabled;
        emit TokenWhitelisted(token, enabled);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Myso: Invalid address");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /**
     * @notice Purchase Myso Gold via USDT/USDC.
     * All tokens are routed to the treasury; backend oracle credits Myso Gold 1:1.
     */
    function buyGold(address token, uint256 tokenAmount) external {
        require(supportedTokens[token], "Myso: Token not supported");
        require(tokenAmount > 0, "Myso: Amount must be greater than zero");

        bool success = IERC20(token).transferFrom(msg.sender, treasury, tokenAmount);
        require(success, "Myso: Transfer to treasury failed");

        emit GoldPurchased(msg.sender, token, tokenAmount, tokenAmount, block.timestamp);
    }

    /**
     * @notice Direct on-chain post unlock with immediate 85/15 split.
     * 85% is transferred directly to the creator's wallet.
     * 15% is transferred directly to the platform treasury.
     */
    function unlockPostDirect(
        bytes32 postId,
        address creator,
        address token,
        uint256 tokenAmount
    ) external {
        require(supportedTokens[token], "Myso: Token not supported");
        require(creator != address(0), "Myso: Invalid creator address");
        require(tokenAmount > 0, "Myso: Amount must be greater than zero");

        uint256 creatorShare = (tokenAmount * CREATOR_SHARE_BPS) / BPS_DENOMINATOR;
        uint256 platformFee = tokenAmount - creatorShare;

        // Transfer 85% to creator
        bool creatorSuccess = IERC20(token).transferFrom(msg.sender, creator, creatorShare);
        require(creatorSuccess, "Myso: Creator payout failed");

        // Transfer 15% to platform treasury
        bool platformSuccess = IERC20(token).transferFrom(msg.sender, treasury, platformFee);
        require(platformSuccess, "Myso: Platform fee transfer failed");

        emit PostUnlocked(
            postId,
            msg.sender,
            creator,
            token,
            tokenAmount,
            creatorShare,
            platformFee,
            block.timestamp
        );
    }
}
