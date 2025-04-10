export interface Bidder {
  auction_id: string;
  bidder: string;
  profile_id: string;
  amount: number;
  timestamp: number;
}

export interface Auction {
  uuid: string;
  auctioneer: string;
  profile_id: string;
  coop: string[];
  start: number;
  end: number;
  item_name: string;
  item_lore: string;
  item_tag: string | null;
  extra: string;
  category: string;
  tier: string;
  starting_bid: number;
  item_bytes: string;
  claimed: boolean;
  claimed_bidders: Bidder[];
  highest_bid_amount: number;
  last_updated: number;
  bin: boolean;
  bids: Bidder[];
  item_uuid: string;
}

export interface AuctionCache {
  data: Auction[];
  timestamp: Date;
}
